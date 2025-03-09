/**
 * Represents a notification.
 * @class
 */
export default class Notification {
  #level = 'normal';
  #persistent = false;
  #text = null;
  #from = null;
  #tos = [];

  toJSON() {
    return {
      level: this.#level,
      persistent: this.#persistent,
      text: this.#text,
      from: this.#from,
      tos: this.#tos,
    };
  }

  /**
   * @param {String} text - The text of the notification.
   */
  setText(text) {
    this.#text = text;
    return this;
  }

  /**
   * @param {String} level - The level of the notification (low, normal, high, critical).
   */
  setLevel(level) {
    this.#level = level;
    return this;
  }

  /**
   * @param {Boolean} persistent - The persistence of the notification.
   */
  setPersistent(persistent) {
    this.#persistent = persistent;
    return this;
  }

  /**
   * @param {String} emitter - The emitter of the notification.
   */
  setFrom(emitter) {
    this.#from = emitter;
    return this;
  }

  /**
   * @param {String} clientId - The client target unique identifier of the notification.
   */
  addTo(clientId) {
    this.#tos.push(clientId);
    return this;
  }
}
