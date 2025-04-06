import Event from './event.js'

/**
 * Represents an alarm.
 * @class
 */
export default class Alarm extends Event {
  toJSON() {
    return {
      type: 'alarm',
    }
  }
}
