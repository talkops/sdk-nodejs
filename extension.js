import Publisher from './publisher.js'
import Subscriber from './subscriber.js'
import Parameter from './parameter.js'
import Readme from './readme.js'
import Manifest from './manifest.js'
import categories from './categories.json' with { type: 'json' }
import pkg from './package.json' with { type: 'json' }

/**
 * Represents an extension.
 * @class
 */
export default class Extension {
  #bootstrap = null
  #category = null
  #debug = false
  #demo = false
  #errors = []
  #features = []
  #functions = []
  #functionSchemas = []
  #icon = null
  #installationSteps = []
  #instructions = null
  #name = null
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
      this.#publisher = new Publisher(
        () => {
          return {
            debug: this.#debug,
            mercure,
          }
        },
        () => {
          return {
            category: this.#category,
            demo: this.#demo,
            errors: this.#errors,
            icon: this.#icon,
            installationSteps: this.#installationSteps,
            instructions: this.#instructions,
            name: this.#name,
            parameters: this.#parameters,
            sdk: {
              name: 'nodejs',
              version: pkg.version,
            },
            softwareVersion: this.#softwareVersion,
            functionSchemas: this.#functionSchemas,
          }
        },
      )
      new Subscriber(() => {
        return {
          debug: this.#debug,
          extension: this,
          functions: this.#functions,
          mercure,
          parameters: this.#parameters,
          publisher: this.#publisher,
          bootstrap: this.#bootstrap,
        }
      })
    }

    if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
      new Readme(() => {
        return {
          features: this.#features,
          name: this.#name,
        }
      })
      new Manifest(() => {
        return {
          category: this.#category,
          demo: this.#demo,
          features: this.#features,
          icon: this.#icon,
          name: this.#name,
          sdk: {
            name: 'nodejs',
            version: pkg.version,
          },
          softwareVersion: this.#softwareVersion,
          website: this.#website,
        }
      })
    }
  }

  /**
   * @param {Function} bootstrap - The extension startup function.
   * @returns {Extension} The updated extension instance.
   */
  setBootstrap(bootstrap) {
    if (typeof bootstrap !== 'function') {
      throw new Error('bootstrap must be a function.')
    }
    this.#bootstrap = bootstrap
    return this
  }

  enableDebug() {
    this.#debug = true
    return this
  }

  /**
   * @param {Boolean} demo - If the extension is a demonstration.
   * @returns {Extension} The updated extension instance.
   */
  setDemo(demo) {
    if (typeof demo !== 'boolean') {
      throw new Error('name must be a boolean.')
    }
    this.#demo = demo
    return this
  }

  /**
   * @param {String} name - The name of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setName(name) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('name must be a non-empty string.')
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
      throw new Error('icon must be a non-empty string.')
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
      throw new Error('website must be a non-empty string.')
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
   * @param {String} softwareVersion - The version of the software.
   * @returns {Extension} The updated extension instance.
   */
  setSoftwareVersion(softwareVersion) {
    this.#softwareVersion = softwareVersion
    return this
  }

  /**
   * @param {String} category - The category of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setCategory(category) {
    if (!categories.includes(category)) {
      throw new Error(`category must be one of the following strings: ${categories.join(', ')}`)
    }
    this.#category = category
    return this
  }

  /**
   * @param {Array<String>} features - The features of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setFeatures(features) {
    if (
      !Array.isArray(features) ||
      !features.every((i) => typeof i === 'string' && i.trim() !== '')
    ) {
      throw new TypeError('features must be an array of non-empty strings.')
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
      !installationSteps.every((i) => typeof i === 'string' && i.trim() !== '')
    ) {
      throw new TypeError('installationSteps must be an array of non-empty strings.')
    }
    this.#installationSteps = installationSteps
    return this
  }

  /**
   * @param {Array<Parameter>} parameters - The parameters of the extension.
   * @returns {Extension} The updated extension instance.
   */
  setParameters(parameters) {
    if (!Array.isArray(parameters) || !parameters.every((f) => typeof Parameter)) {
      throw new TypeError('parameters must be an array of Parameter instances.')
    }
    this.#parameters = parameters
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
    if (!this.#errors.includes(error)) {
      this.#errors.push(error)
    }
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
    if (
      !Array.isArray(functionSchemas) ||
      !functionSchemas.every((schema) => typeof schema === 'object' && schema !== null)
    ) {
      throw new Error('functionSchemas must be an array of non-null objects.')
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
      throw new Error('functions must be an array of named functions.')
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
