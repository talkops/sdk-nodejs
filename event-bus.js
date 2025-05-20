import { createConnection } from 'net'

export default class EventBus {
  #useState = null
  #useConfig = null
  #setEnabled = null
  #lastEventState = null
  #client = null

  constructor(useState, useConfig, setEnabled) {
    this.#useState = useState
    this.#useConfig = useConfig
    this.#setEnabled = setEnabled
    this.#client = createConnection(process.env.TALKOPS_SOCKET, () => {
      this.publishEvent({ type: 'init' })
      this.#publishStatePeriodically()
    })
    this.#client.on('data', (data) => {
      this.#onEvent(JSON.parse(data.toString()))
    })
  }

  #generateEventState() {
    return { type: 'state', state: this.#useState() }
  }

  async #publishState() {
    const event = this.#generateEventState()
    this.#lastEventState = JSON.stringify(event)
    await this.publishEvent(event)
  }

  async publishEvent(event) {
    this.#client.write(`${JSON.stringify(event)}\n`)
  }

  async #publishStatePeriodically() {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const event = this.#generateEventState()
      const lastEventState = JSON.stringify(event)
      if (this.#lastEventState !== lastEventState) {
        this.#lastEventState = lastEventState
        this.publishEvent(event)
      }
    }
  }

  async #onEvent(event) {
    const config = this.#useConfig()
    if (event.type === 'boot') {
      this.#setEnabled(event.enabled)
      for (const name of Object.keys(event.parameters)) {
        for (const parameter of config.parameters) {
          if (parameter.getName() !== name) continue
          parameter.setValue(
            typeof event.parameters[name] === 'string' ? event.parameters[name] : '',
          )
        }
      }
      this.#publishState()
    }
    if (event.type === 'enable') {
      this.#setEnabled(true)
    }
    if (event.type === 'disable') {
      this.#setEnabled(false)
    }
    let ready = true
    for (const parameter of config.parameters) {
      if (parameter.isOptional()) continue
      if (parameter.hasValue()) continue
      ready = false
    }
    if (!ready) return
    if (event.type === 'function_call') {
      for (const fn of config.functions) {
        if (fn.name !== event.name) continue
        const match = fn.toString().match(/\(([^)]*)\)/)
        const argumentsList = (match ? match[1].split(',').map((p) => p.trim()) : []).map(
          (name) => event.args[name] ?? event.defaultArgs[name],
        )
        event.output = await Reflect.apply(fn, null, argumentsList)
        this.publishEvent(event)
        return
      }
    }
    if (config.callbacks[event.type]) {
      const match = config.callbacks[event.type].toString().match(/\(([^)]*)\)/)
      const argumentsList = (match ? match[1].split(',').map((p) => p.trim()) : []).map(
        (name) => event.args[name],
      )
      await Reflect.apply(config.callbacks[event.type], null, argumentsList)
    }
  }
}
