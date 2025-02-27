import Module, { ModuleType } from "./module.js";

export default class Extension extends Module {
  instructions = "";
  functionSchemas = [];
  functions = [];

  constructor(name) {
    super(name, ModuleType.EXTENSION);
  }

  async setInstructions(instructions) {
    this.instructions = await this.resolveToString(instructions);
  }

  async setFunctionSchemas(functionSchemas) {
    this.functionSchemas = await this.resolve(functionSchemas);
  }

  async setFunctions(functions) {
      if (
        !Array.isArray(functions) ||
        !this.functions.every((fn) => typeof fn === 'function') ||
        !this.functions.every((fn) => fn.name.trim().length > 0)
      ) {
        throw new Error("functions must be an array of named function.");
      }
    this.functions = functions;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      instructions: this.instructions,
      functionSchemas: this.functionSchemas,
    };
  }
}
