/**
 * Represents a parameter.
 * @class
 */
export default class Parameter {
  #name = null
  #description = null
  #value = null
  #defaultValue = null
  #availableValues = []
  #possibleValues = []
  #optional = false

  /**
   * @param {String} name - The name of the parameter.
   * @returns {Parameter} The created parameter instance.
   */
  constructor(name) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('name is required and must be a non-empty string.')
    }
    if (!/^[A-Z0-9_]+$/.test(name)) {
      throw new Error('name expected uppercase letters, numbers, and underscores.')
    }
    this.#name = name
  }

  /**
   * @returns {String} The name of the parameter.
   */
  getName() {
    return this.#name
  }

  /**
   * @param {Boolean} optional - If the parameter is optional.
   * @returns {Parameter} The updated parameter instance.
   */
  setOptional(optional) {
    if (typeof optional !== 'boolean') {
      throw new Error('optional must be a boolean.')
    }
    this.#optional = optional
    return this
  }

  /**
   * @param {String} description - The description of the parameter.
   * @returns {Parameter} The updated parameter instance.
   */
  setDescription(description) {
    if (typeof description !== 'string' || description.trim() === '') {
      throw new Error('description is required and must be a non-empty string.')
    }
    this.#description = description
    return this
  }

  /**
   * @param {String} defaultValue - The default value of the parameter.
   * @returns {Parameter} The updated parameter instance.
   */
  setDefaultValue(defaultValue) {
    if (typeof defaultValue !== 'string' || defaultValue.trim() === '') {
      throw new Error('defaultValue is required and must be a non-empty string.')
    }
    this.#defaultValue = defaultValue
    return this
  }

  /**
   * @returns {String} The value of the parameter.
   */
  getValue() {
    return process.env[this.#name] ?? (this.#value || this.#defaultValue)
  }

  /**
   * @param {String} value - The value of the parameter.
   * @returns {Parameter} The updated parameter instance.
   */
  setValue(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error('value is required and must be a non-empty string.')
    }
    this.#value = value
    return this
  }

  /**
   * @param {Array<String>} availableValues - The available values of the parameter.
   * @returns {Parameter} The updated parameter instance.
   */
  setAvailableValues(availableValues) {
    if (!Array.isArray(availableValues) || availableValues.length === 0) {
      throw new Error('availableValues must be a non-empty array.')
    }
    if (!availableValues.every((value) => typeof value === 'string' && value.trim() !== '')) {
      throw new Error('Each item in availableValues must be a non-empty string.')
    }
    this.#availableValues = availableValues
    return this
  }

  /**
   * @param {Array<String>} possibleValues - The possible values of the parameter.
   * @returns {Parameter} The updated parameter instance.
   */
  setPossibleValues(possibleValues) {
    if (!Array.isArray(possibleValues) || possibleValues.length === 0) {
      throw new Error('possibleValues must be a non-empty array.')
    }
    if (!possibleValues.every((value) => typeof value === 'string' && value.trim() !== '')) {
      throw new Error('Each item in possibleValues must be a non-empty string.')
    }
    this.#possibleValues = possibleValues
    return this
  }

  toJSON() {
    return {
      name: this.#name,
      description: this.#description,
      env: process.env[this.#name] !== undefined,
      defaultValue: this.#defaultValue,
      availableValues: this.#availableValues,
      possibleValues: this.#possibleValues,
      optional: this.#optional,
    }
  }
}
