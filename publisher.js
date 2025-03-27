import axios from 'axios'

export default class Publisher {
  #useConfig = null
  #useState = null
  #lastEventState = null

  constructor(useConfig, useState) {
    this.#useConfig = useConfig
    this.#useState = useState
    setTimeout(() => this.#publishState(), 1000)
  }

  publishState() {
    this.publishEvent({ type: 'state', state: this.#useState() })
  }

  async publishEvent(event) {
    const config = this.#useConfig()
    config.debug && console.log('pub', event.type)
    await axios.post(
      config.mercure.url,
      new URLSearchParams({
        topic: config.mercure.publisher.topic,
        data: JSON.stringify(event),
      }),
      {
        headers: {
          Authorization: `Bearer ${config.mercure.publisher.token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
  }

  async #publishState() {
    const state = this.#useState()
    const event = { type: 'state', state }
    const lastEventState = JSON.stringify(event)
    if (this.#lastEventState !== lastEventState) {
      await this.publishEvent(event)
      this.#lastEventState = lastEventState
    }
    setTimeout(() => this.#publishState(), 1000)
  }
}
