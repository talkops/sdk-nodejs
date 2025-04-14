import Link from './link.js'

/**
 * Represents an video.
 * @class
 */
export default class Video extends Link {
  toJSON() {
    return {
      ...super.toJSON(),
      type: 'video',
    }
  }
}
