import Message from "./message.js";

const NotificationLevels = Object.freeze({
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  CRITICAL: "critical",
});

/**
 * Represents a notification.
 * @class
 */
export default class Notification extends Message {
  #level = "normal";

  toJSON() {
    return {
      ...super.toJSON(),
      type: "notification",
      level: this.#level,
    };
  }

  /**
   * @param {String} level - The level of the notification (low, normal, high, critical).
   * @returns {Notification} The updated notification instance.
   */
  setLevel(level) {
    if (!Object.values(NotificationLevels).includes(level)) {
      throw new Error(`Invalid priority: ${level}`);
    }
    this.#level = level;
    return this;
  }
}
