import Message from "./message.js";

/**
 * Represents an alarm.
 * @class
 */
export default class Alarm extends Message {
  toJSON() {
    return {
      ...super.toJSON(),
      type: 'alarm',
    };
  }
}
