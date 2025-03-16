/**
 * Represents a parameter.
 * @class
 */
export default class Parameter {
  #name = null
  #description = null
  #defaultValue = null
  #availableValues = []
  #possibleValues = []
  #multipleValues = false

  constructor(name) {
    this.setName(name)
  }

  /**
   * @param {String} name - The name of the parameter.
   * @returns {Parameter} The updated parameter instance.
   */
  setName(name) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('name is required and must be a non-empty string.')
    }
    if (!/^[A-Z0-9_]+$/.test(name)) {
      throw new Error('name expected uppercase letters, numbers, and underscores.')
    }
    this.#name = name
    return this
  }

  /**
   * @param {String} description - The description of the parameter.
   * @returns {Parameter} The updated parameter instance.
   */
  setDescription(description) {
    this.#description = description
    return this
  }

  /**
   * @param {String} defaultValue - The default value of the parameter.
   * @returns {Parameter} The updated parameter instance.
   */
  setDefaultValue(defaultValue) {
    this.#defaultValue = defaultValue
    return this
  }

  /**
   * @param {Array} availableValues - The available values of the parameter.
   * @returns {Parameter} The updated parameter instance.
   */
  setAvailableValues(availableValues) {
    this.#availableValues = availableValues
    return this
  }

  /**
   * @param {Array} possibleValues - The possible values of the parameter.
   * @returns {Parameter} The updated parameter instance.
   */
  setPossibleValues(possibleValues) {
    this.#possibleValues = possibleValues
    return this
  }

  /**
   * @param {Boolean} multipleValues - Useful to specify if the parameter supports multiple values.
   * @returns {Parameter} The updated parameter instance.
   */
  setMultipleValues(multipleValues) {
    this.#multipleValues = multipleValues
    return this
  }

  toJSON() {
    return {
      name: this.#name,
      description: this.#description,
      defaultValue: this.#defaultValue,
      availableValues: this.#availableValues,
      possibleValues: this.#possibleValues,
      multipleValues: this.#multipleValues,
    }
  }
}
