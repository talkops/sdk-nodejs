import axios from "axios";
import fs from "fs";
import ejs from "ejs";
import Module from "./module.js";

/**
 * Represents a readme.
 * @class
 */
export default class Readme {

  /**
   * @param {string} templateUrl - The template URL.
   * @param {string} path - The path of the readme file.
   * @param {Module} module - The module (e.g. an extension).
   */
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
