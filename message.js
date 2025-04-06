import Event from './event.js'

/**
 * Represents a message.
 * @class
 */
export default class Message extends Event {
  #text = null

  toJSON() {
    return {
      text: this.#text,
      type: 'message',
    }
  }

  /**
   * @param {String} text - The text of the message.
   * @returns {Message} The updated message instance.
   */
  setText(text) {
    this.#text = text
    return this
  }
}
