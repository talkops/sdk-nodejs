import axios from "axios";
import fs from "fs";
import ejs from "ejs";
import Module from "./module.js";

export default class Readme {
  constructor(templateUrl, path, module) {
    if (!(module instanceof Module)) {
      throw new Error("module must be a Module instance.");
    }
    this.templateUrl = templateUrl;
    this.path = path;
    this.module = module;
    this.#generate();
  }

  async #generate() {
    try {
      const response = await axios.get(this.templateUrl);
      const template = response.data;
      const output = ejs.render(template, { module: this.module });

      await fs.promises.writeFile(this.path, output);
      console.log("Readme", "generated");
    } catch (err) {
      console.error("Readme", err);
    }
  }
}
