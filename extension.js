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
  #categories = []
  #dockerRepository = null
  #icon = null
  #instructions = null
  #name = null
  #version = null
  #errors = []
  #features = []
  #functions = []
  #functionSchemas = []
  #installationSteps = []
  #parameters = []
  #parameterValues = {}
  #softwareVersion = null
  #website = null

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
        instructions: this.#instructions,
        name: this.#name,
        sdk: {
          name: 'nodejs',
          version: pkg.version,
        },
        softwareVersion: this.#softwareVersion,
        version: this.#version,
        errors: this.#errors,
        parameters: this.#parameters,
        functionSchemas: this.#functionSchemas,
      }
    })
    new Subscriber(
      mercure,
      () => {
        return {
          functions: this.#functions,
          setParameterValues: this.#setParameterValues,
        }
      },
      this.#publisher,
    )

    if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
      new Readme(() => {
        return {
          dockerRepository: this.#dockerRepository,
          features: this.#features,
          name: this.#name,
        }
      })
      new Manifest(() => {
        return {
          categories: this.#categories,
          dockerRepository: this.#dockerRepository,
          features: this.#features,
          icon: this.#icon,
          installationSteps: this.#installationSteps,
          name: this.#name,
          sdk: {
            name: 'nodejs',
            version: pkg.version,
          },
          version: this.#version,
          website: this.#website,
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
   * @param {String} icon - The icon url of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setIcon(icon) {
    if (typeof icon !== 'string' || icon.trim() === '') {
      throw new Error('icon is required and must be a non-empty string.')
    }
    try {
      new URL(icon)
    } catch (_) {
      throw new Error('icon must be a valid URL.')
    }
    this.#icon = icon
    return this
  }

  /**
   * @param {String} website - The website url of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setWebsite(website) {
    if (typeof website !== 'string' || website.trim() === '') {
      throw new Error('website is required and must be a non-empty string.')
    }
    try {
      new URL(website)
    } catch (_) {
      throw new Error('website must be a valid URL.')
    }
    this.#website = website
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
   * @param {Array<String>} categories - The categories of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setCategories(categories) {
    if (!Array.isArray(categories) || !categories.every((f) => typeof f === 'string')) {
      throw new TypeError('categories must be an array of strings')
    }
    this.#categories = categories
    return this
  }

  /**
   * @param {Array<String>} features - The features of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setFeatures(features) {
    if (!Array.isArray(features) || !features.every((f) => typeof f === 'string')) {
      throw new TypeError('features must be an array of strings')
    }
    this.#features = features
    return this
  }

  /**
   * @param {Array<String>} installationSteps - The installation steps of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setinstallationSteps(installationSteps) {
    if (
      !Array.isArray(installationSteps) ||
      !installationSteps.every((f) => typeof f === 'string')
    ) {
      throw new TypeError('installationSteps must be an array of strings')
    }
    this.#installationSteps = installationSteps
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
   * @param {String} name - The name of the parameter.
   * @returns {String|Array<String>} The value(s) of the parameter.
   */
  getParameterValue(name) {
    for (const parameter of this.#parameters) {
      const parameterJson = parameter.toJSON()
      if (parameterJson.name !== name) continue
      if (process.env[name] !== undefined) {
        return parameterJson.multipleValues ? process.env[name].split(',') : process.env[name]
      }
      if (this.#parameterValues[name] !== undefined) {
        return this.#parameterValues[name]
      }
      return parameterJson.defaultValue ?? null
    }
    return null
  }

  /**
   * @param {String} dockerRepository - The docker repository of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setDockerRepository(dockerRepository) {
    this.#dockerRepository = dockerRepository
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
