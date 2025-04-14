import Link from './link.js'

/**
 * Represents an image.
 * @class
 */
export default class Image extends Link {
  toJSON() {
    return {
      ...super.toJSON(),
      type: 'image',
    }
  }
}
