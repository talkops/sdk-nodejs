import fs from 'fs'
import ejs from 'ejs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default class Readme {
  #getter = null

  constructor(getter) {
    this.#getter = getter
    setTimeout(() => this.#generate(), 500)
  }

  #generate() {
    const template = fs.readFileSync(`${__dirname}/readme.ejs`, 'utf8')
    const output = ejs.render(template, { extension: this.#getter() })
    fs.writeFileSync('/app/README.md', output, 'utf8')
  }
}
