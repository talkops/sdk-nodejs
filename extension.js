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
  #softwareVersion = null
  #website = null

  #publisher = null

  /**
   * @param {String} token - The token of the extension.
   * @returns {Extension} The created extension instance.
   */
  constructor(token) {
    token = token || process.argv[2] || process.env.TALKOPS_TOKEN
    if (token) {
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
            parameters: this.#parameters,
          }
        },
        this.#publisher,
      )
    }

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
   * @param {String} dockerRepository - The docker repository of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setDockerRepository(dockerRepository) {
    this.#dockerRepository = dockerRepository
    return this
  }

  /**
   * Add an error.
   * @param {String} error - The error message.
   * @returns {Extension} The updated extension instance.
   */
  addError(error) {
    if (typeof error !== 'string' || error.trim() === '') {
      throw new Error('error must be a non-empty string.')
    }
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
   * @param {String} instructions - The instructions of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setInstructions(instructions) {
    if (typeof instructions !== 'string' || instructions.trim() === '') {
      throw new Error('instructions must be a non-empty string.')
    }
    this.#instructions = instructions
    return this
  }

  /**
   * @param {Array<Object>} functionSchemas - The function schemas of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setFunctionSchemas(functionSchemas) {
    if (!Array.isArray(functionSchemas) || functionSchemas.length === 0) {
      throw new Error('functionSchemas must be a non-empty array.')
    }
    if (!functionSchemas.every((schema) => typeof schema === 'object' && schema !== null)) {
      throw new Error('Each item in functionSchemas must be a non-null object.')
    }
    this.#functionSchemas = functionSchemas
    return this
  }

  /**
   * @param {Array<Function>} functions - The functions of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setFunctions(functions) {
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
}
