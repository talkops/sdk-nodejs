/**
 * Represents a message.
 * @class
 */
export default class Message {
  #text = null;
  #from = null;
  #tos = [];

  toJSON() {
    return {
      text: this.#text,
      from: this.#from,
      tos: this.#tos,
    };
  }

  /**
   * @param {String} text - The text of the message.
   * @returns {Message} The updated message instance.
   */
  setText(text) {
    this.#text = text;
    return this;
  }

  /**
   * @param {String} emitter - The emitter of the message.
   * @returns {Message} The updated message instance.
   */
  setFrom(emitter) {
    this.#from = emitter;
    return this;
  }

  /**
   * @param {String} clientId - The client target unique identifier of the message.
   * @returns {Message} The updated message instance.
   */
  addTo(clientId) {
    this.#tos.push(clientId);
    return this;
  }
}
