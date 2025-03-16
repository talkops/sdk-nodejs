import { EventSource } from 'eventsource'

export default class Subscriber {
  #url = null
  #topic = null
  #token = null
  #useExtension = null
  #publisher = null

  constructor(mercure, useExtension, publisher) {
    this.#url = mercure.url
    this.#topic = mercure.subscriber.topic
    this.#token = mercure.subscriber.token
    this.#useExtension = useExtension
    this.#publisher = publisher
    this.#subscribe()
  }

  #subscribe() {
    new EventSource(`${this.#url}?topic=${encodeURIComponent(this.#topic)}`, {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          headers: {
            ...init.headers,
            Authorization: `Bearer ${this.#token}`,
          },
        }),
    }).addEventListener('message', (message) => this.#onEvent(JSON.parse(message.data)))
  }

  async #onEvent(event) {
    if (event.type === 'request_state') {
      this.#publisher.resetData()
    }
    if (event.type === 'function_call') {
      const extension = this.#useExtension()
      for (const fn of extension.functions) {
        if (fn.name !== event.name) continue
        const match = fn.toString().match(/\(([^)]*)\)/)
        const argumentsList = (match ? match[1].split(',').map((p) => p.trim()) : []).map(
          (name) => event.args[name] ?? event[name],
        )
        event.output = await Reflect.apply(fn, null, argumentsList)
        this.#publisher.publishEvent(event)
        return
      }
    }
  }
}
