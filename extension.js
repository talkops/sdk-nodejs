import Publisher from './publisher.js'
import Subscriber from './subscriber.js'
import Parameter from './parameter.js'
import Readme from './readme.js'
import Manifest from './manifest.js'
import pkg from './package.json' with { type: 'json' }

/**
 * Represents an extension.
 * @class
 */
export default class Extension {
  #name = null
  #version = null
  #softwareVersion = null
  #description = null
  #installationGuide = null
  #features = []
  #parameters = []
  #parameterValues = {}
  #dockerRepository = null
  #errors = []
  #instructions = null
  #functionSchemas = []
  #functions = []
  #publisher = null

  /**
   * @param {String} token - The token of the extension.
   * @returns {Extension} The created extension instance.
   */
  constructor(token) {
    token = token || process.argv[2] || process.env.TALKOPS_TOKEN
    if (!token) {
      console.error('The token is required.')
      process.exit(1)
    }
    const mercure = JSON.parse(Buffer.from(token, 'base64').toString())
    this.#publisher = new Publisher(mercure, () => {
      return {
        name: this.#name,
        sdk: {
          name: 'nodejs',
          version: pkg.version,
        },
        version: this.#version,
        softwareVersion: this.#softwareVersion,
        dockerRepository: this.#dockerRepository,
        errors: this.#errors,
        parameters: this.#parameters,
        instructions: this.#instructions,
        functionSchemas: this.#functionSchemas,
      }
    })
    new Subscriber(mercure, () => {
      return {
        functions: this.#functions,
        setParameterValues: this.#setParameterValues,
      }
    })

    if (process.env.NODE_ENV === 'development' || false) {
      new Readme(() => {
        return {
          name: this.#name,
          dockerRepository: this.#dockerRepository,
          description: this.#description,
          features: this.#features,
        }
      })
      new Manifest(() => {
        return {
          name: this.#name,
          versions: {
            extension: this.#version,
            sdk: `${pkg.version}-nodejs`,
          },
          description: this.#description,
          installationGuide: this.#installationGuide,
        }
      })
    }
  }

  /**
   * @param {String} name - The name of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setName(name) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('name is required and must be a non-empty string.')
    }
    this.#name = name
    return this
  }

  /**
   * @param {String} version - The version of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setVersion(version) {
    this.#version = version
    return this
  }

  /**
   * @param {String} softwareVersion - The version of the software.
   * @returns {Extension} The updated extension instance.
   */
  setSoftwareVersion(softwareVersion) {
    this.#softwareVersion = softwareVersion
    return this
  }

  /**
   * @param {String} description - The description of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setDescription(description) {
    this.#description = description
    return this
  }

  /**
   * @param {String} features - The features of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setFeatures(features) {
    this.#features = features
    return this
  }

  /**
   * @param {String} installationGuide - The installation guide of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setInstallationGuide(installationGuide) {
    this.#installationGuide = installationGuide
    return this
  }

  /**
   * @param {Array<Parameter>} parameters - The parameters of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setParameters(parameters) {
    this.#parameters = parameters
    return this
  }

  /**
   * @param {Object} parameterValues - The parameter values of the extension.
   * @returns {Extension} The updated extension instance.
   */
  #setParameterValues(parameterValues) {
    this.#parameterValues = parameterValues
    return this
  }

  /**
   * @returns {Object} The parameter values of the extension.
   */
  getParameterValues() {
    return this.#parameterValues
  }

  /**
   * @param {String} dockerRepository - The docker repository of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setDockerRepository(dockerRepository) {
    this.dockerRepository = dockerRepository
    return this
  }

  /**
   * Add an error.
   * @returns {Extension} The updated extension instance.
   */
  addError(error) {
    this.#errors.push(error)
    return this
  }

  /**
   * Clear errors.
   * @returns {Extension} The updated extension instance.
   */
  clearErrors() {
    this.#errors = []
    return this
  }

  /**
   * @param {String|Array<String>|Function} instructions - The instructions of the extension for the AI agent.
   * @returns {Extension} The updated extension instance.
   */
  async setInstructions(instructions) {
    this.#instructions = await this.#resolveToString(instructions)
    return this
  }

  /**
   * @param {Array<Object>|Function} functionSchemas - The function schemas of the extension for the AI agent.
   * @returns {Extension} The updated extension instance.
   */
  async setFunctionSchemas(functionSchemas) {
    this.#functionSchemas = await this.#resolve(functionSchemas)
    return this
  }

  /**
   * @param {Array<Function>} functions - The named functions of the extension.
   * @returns {Extension} The updated extension instance.
   */
  async setFunctions(functions) {
    if (
      !Array.isArray(functions) ||
      !this.#functions.every((fn) => typeof fn === 'function') ||
      !this.#functions.every((fn) => fn.name.trim().length > 0)
    ) {
      throw new Error('functions must be an array of named function.')
    }
    this.#functions = functions
    return this
  }

  /**
   * Send one or more events.
   * @param {Event|Array<Event>} events - The events.
   */
  send(events) {
    events = Array.isArray(events) ? events : [events]
    if (!events.every((item) => item instanceof Event)) {
      throw new Error('events must be an array of Event instances.')
    }
    for (const event of events) {
      this.#publisher.publishEvent(event.toJSON())
    }
  }

  async #resolve(arg) {
    if (arg === undefined) return undefined
    if (arg.constructor.name === 'AsyncFunction') {
      arg = await arg()
    } else if (arg.constructor.name === 'Function') {
      arg = arg()
    }
    return arg
  }

  async #resolveToString(arg) {
    if (arg === undefined) return ''
    arg = await this.#resolve(arg)
    if (arg.constructor.name === 'Array') {
      arg = arg.join('\n')
    }
    return String(arg).trim()
  }
}
