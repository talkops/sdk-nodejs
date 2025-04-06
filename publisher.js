import axios from 'axios'

export default class Publisher {
  #useConfig = null
  #useState = null
  #lastEventState = null
  #lastPingAt = null

  constructor(useConfig, useState) {
    this.#useConfig = useConfig
    this.#useState = useState
    setTimeout(() => this.#publishState(), 1000)

    const originalStdoutWrite = process.stdout.write
    process.stdout.write = (chunk) => {
      this.publishEvent({
        type: 'stdout',
        data: chunk.toString().trim(),
      })
      originalStdoutWrite.call(process.stdout, chunk)
    }
    const originalStderrWrite = process.stderr.write
    process.stderr.write = (chunk) => {
      this.publishEvent({
        type: 'stderr',
        data: chunk.toString().trim(),
      })
      originalStderrWrite.call(process.stderr, chunk)
    }
  }

  async publishState() {
    const event = { type: 'state', state: this.#useState() }
    this.#lastEventState = JSON.stringify(event)
    await this.publishEvent(event)
  }

  onPing() {
    this.#lastPingAt = new Date().getTime()
    this.publishEvent({ type: 'pong' })
  }

  async publishEvent(event) {
    if (this.#lastPingAt && this.#lastPingAt < new Date().getTime() - 6000) return
    const config = this.#useConfig()
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
    const event = { type: 'state', state: this.#useState() }
    const lastEventState = JSON.stringify(event)
    if (this.#lastEventState !== lastEventState) {
      await this.publishEvent(event)
      this.#lastEventState = lastEventState
    }
    setTimeout(() => this.#publishState(), 1000)
  }
}
