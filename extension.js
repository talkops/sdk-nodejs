import Module, { ModuleType } from './module.js'

/**
 * Represents an extension.
 * @class
 */
export default class Extension extends Module {
  instructions = ''
  functionSchemas = []
  functions = []

  /**
   * @param {String} name - The name of the extension.
   */
  constructor(name) {
    super(name, ModuleType.EXTENSION)
  }

  /**
   * @param {String|Array<String>|Function|AsyncFunction} instructions - The instructions of the extension for the AI agent.
   */
  async setInstructions(instructions) {
    this.instructions = await this.resolveToString(instructions)
  }

  /**
   * @param {Array<Object>|Function|AsyncFunction} functionSchemas - The function schemas of the extension for the AI agent.
   */
  async setFunctionSchemas(functionSchemas) {
    this.functionSchemas = await this.resolve(functionSchemas)
  }

  /**
   * @param {Array<Function|AsyncFunction>} functions - The named functions of the extension.
   */
  async setFunctions(functions) {
    if (
      !Array.isArray(functions) ||
      !this.functions.every((fn) => typeof fn === 'function') ||
      !this.functions.every((fn) => fn.name.trim().length > 0)
    ) {
      throw new Error('functions must be an array of named function.')
    }
    this.functions = functions
  }

  toJSON() {
    return {
      ...super.toJSON(),
      instructions: this.instructions,
      functionSchemas: this.functionSchemas,
    }
  }
}
