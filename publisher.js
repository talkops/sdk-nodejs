import axios from 'axios'

export default class Publisher {
  #url = null
  #topic = null
  #token = null
  #useExtension = null
  #data = null

  constructor(mercure, useExtension) {
    this.#url = mercure.url
    this.#topic = mercure.publisher.topic
    this.#token = mercure.publisher.token
    this.#useExtension = useExtension
    setTimeout(() => this.#publishState(), 1000)
  }

  resetData() {
    this.#data = null
  }

  async publishEvent(event) {
    const extension = this.#useExtension()
    extension.debug && console.log('pub', event.type)
    await axios.post(
      this.#url,
      new URLSearchParams({
        topic: this.#topic,
        data: JSON.stringify(event),
      }),
      {
        headers: {
          Authorization: `Bearer ${this.#token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
  }

  async #publishState() {
    const extension = this.#useExtension()
    const event = { type: 'state', extension }
    const data = JSON.stringify(event)
    if (this.#data !== data) {
      await this.publishEvent(event)
      this.#data = data
    }
    setTimeout(() => this.#publishState(), 1000)
  }
}
