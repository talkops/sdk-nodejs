import { EventSource } from 'eventsource'
import eventTypes from './event-types.json' with { type: 'json' }

export default class Subscriber {
  #useConfig = null

  constructor(useConfig) {
    this.#useConfig = useConfig
    this.#subscribe()
  }

  #subscribe() {
    const config = this.#useConfig()
    new EventSource(
      `${config.mercure.url}?topic=${encodeURIComponent(config.mercure.subscriber.topic)}`,
      {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            headers: {
              ...init.headers,
              Authorization: `Bearer ${config.mercure.subscriber.token}`,
            },
          }),
      },
    ).addEventListener('message', (message) => this.#onEvent(JSON.parse(message.data)))
  }

  async #onEvent(event) {
    const config = this.#useConfig()
    if (event.type === 'ping') {
      config.publisher.onPing()
      return
    }
    if (event.type === 'function_call') {
      for (const fn of config.functions) {
        if (fn.name !== event.name) continue
        const match = fn.toString().match(/\(([^)]*)\)/)
        const argumentsList = (match ? match[1].split(',').map((p) => p.trim()) : []).map(
          (name) => event.args[name] ?? event.defaultArgs[name],
        )
        event.output = await Reflect.apply(fn, null, argumentsList)
        config.publisher.publishEvent(event)
        return
      }
    }
    if (event.type === 'boot') {
      for (const name of Object.keys(event.parameters)) {
        for (const parameter of config.parameters) {
          if (parameter.getName() !== name) continue
          parameter.setValue(event.parameters[name])
        }
      }
      let ready = true
      for (const parameter of config.parameters) {
        if (parameter.isOptional()) continue
        if (parameter.hasValue()) continue
        ready = false
      }
      config.publisher.publishState()
      if (!ready) return
    }
    if (eventTypes.includes(event.type) && config.callbacks[event.type]) {
      const match = config.callbacks[event.type].toString().match(/\(([^)]*)\)/)
      const argumentsList = (match ? match[1].split(',').map((p) => p.trim()) : []).map(
        (name) => event.args[name],
      )
      await Reflect.apply(config.callbacks[event.type], null, argumentsList)
    }
  }
}
