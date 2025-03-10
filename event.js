/**
 * Represents an event.
 * @class
 */
export default class Event {
  #from = null;
  #tos = [];

  toJSON() {
    return {
      from: this.#from,
      tos: this.#tos,
    };
  }

  /**
   * @param {String} emitter - The emitter of the event.
   * @returns {Event} The updated event instance.
   */
  setFrom(emitter) {
    this.#from = emitter;
    return this;
  }

  /**
   * @param {String} clientId - The client target unique identifier of the event.
   * @returns {Event} The updated event instance.
   */
  addTo(clientId) {
    this.#tos.push(clientId);
    return this;
  }
}
