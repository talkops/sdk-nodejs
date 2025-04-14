import Media from './media.js'

/**
 * Represents a link.
 * @class
 */
export default class Link extends Media {
  #url = null

  constructor(url) {
    super()
    this.setUrl(url)
  }

  toJSON() {
    return {
      type: 'link',
      url: this.#url,
    }
  }

  /**
   * @param {String} url - The url of the link.
   * @returns {Link} The updated link instance.
   * @throws {TypeError} If the url is not a valid URL.
   */
  setUrl(url) {
    try {
      new URL(url)
    } catch (e) {
      throw new TypeError(`Invalid URL: ${url}`)
    }
    this.#url = url
    return this
  }
}
