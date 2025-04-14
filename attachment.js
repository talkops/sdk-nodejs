import Link from './link.js'

/**
 * Represents an attachment.
 * @class
 */
export default class Attachment extends Link {
  #filename = null

  constructor(url, filename) {
    super(url)
    this.setFilename(filename)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      filename: this.#filename,
      type: 'attachment',
    }
  }

  /**
   * @param {String} filename - The filename of the attachment.
   * @returns {Attachment} The updated attachment instance.
   * @throws {TypeError} If the filename is not valid.
   */
  setFilename(filename) {
    if (typeof filename !== 'string' || filename.trim() === '') {
      throw new TypeError('Filename must be a non-empty string.')
    }
    const illegalChars = /[\\/:*?"<>|]/g
    if (illegalChars.test(filename)) {
      throw new TypeError(`Filename contains invalid characters: ${filename}`)
    }
    this.#filename = filename
    return this
  }
}
