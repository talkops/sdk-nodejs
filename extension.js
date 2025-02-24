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
