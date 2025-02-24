import Module, { ModuleType } from "./module.js";

export default class Kernel extends Module {
  parameters = {};
  constructor(name) {
    super(name, ModuleType.KERNEL);
  }
  async setParameters(parameters) {
    this.parameters = await this.resolve(parameters);
  }
  toJSON() {
    return { ...super.toJSON(), parameters: this.parameters };
  }
}
