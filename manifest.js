import fs from 'fs'

export default class Manifest {
  #useExtension = null

  constructor(useExtension) {
    this.#useExtension = useExtension
    setTimeout(() => this.#generate(), 500)
  }

  #generate() {
    fs.writeFileSync('/app/manifest.json', JSON.stringify(this.#useExtension(), null, 2), 'utf8')
  }
}
