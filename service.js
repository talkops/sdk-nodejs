import crypto from "crypto";
import WebSocket from "ws";
import Module from "./module.js";
import pkg from "./package.json" with { type: "json" };
import yaml from "js-yaml";

/**
 * Represents a service.
 * @class
 */
export default class Service {
  #modules = null;
  #sockets = null;

  /**
   * @param {Array<String>} agentUrls - The agent URLs.
   * @param {Module|String<Module>} modules - The modules (e.g. an extension).
   */
  constructor(agentUrls, modules) {
    this.#modules = Array.isArray(modules) ? modules : [modules];
    if (
      !Array.isArray(this.#modules) ||
      !this.#modules.every((item) => item instanceof Module)
    ) {
      throw new Error("modules must be an array of Module instances.");
    }
    this.#sockets = new Map();
    this.#execute(agentUrls);
  }
  #execute(agentUrls) {
    agentUrls.filter(Boolean).forEach((url) => this.#initSocket(url));
    setInterval(this.#publish.bind(this), 1000);
  }
  #initSocket(url) {
    const socket = new WebSocket(url);
    this.#sockets.set(url, socket);
    socket.onopen = () => {
      console.log("Service", url, "connected");
    };
    socket.onerror = (err) => {
      console.error("Service", url, "socket.error", err);
    };
    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== "function_call") return;
      for (const module of this.#modules) {
        if (module.type !== "Extension") continue;
        if (module.functions.length === 0) continue;
        for (const fn of module.functions) {
          if (fn.name !== data.name) continue;
          const match = fn.toString().match(/\(([^)]*)\)/);
          const argumentsList = (
            match ? match[1].split(",").map((p) => p.trim()) : []
          ).map((name) => data.args[name]);
          data.output = await Reflect.apply(fn, null, argumentsList);
          if (typeof data.output === "boolean") {
            data.output = data.output ? "Yes" : "No";
          } else if (typeof data.output === "object") {
            data.output = yaml.dump(data.output);
          }
          socket.send(JSON.stringify(data));
          return;
        }
      }
    };
    socket.onclose = (e) => {
      console.error("Service", url, "disconnected", e.reason);
      this.#sockets.delete(url);
      setTimeout(this.#initSocket.bind(this, url), 1000);
    };
  }
  #publish() {
    for (const module of this.#modules) {
      module.errors = [...new Set(module.errors)];
    }
    if (this.#sockets === undefined) return;
    const message = JSON.stringify({
      sdk: {
        name: "nodejs",
        version: pkg.version,
      },
      modules: this.#modules,
    });
    for (const [url, socket] of this.#sockets) {
      const hash = crypto.createHash("sha256").update(message).digest("hex");
      if (socket.lastHash === undefined || socket.lastHash !== hash) {
        socket.send(message);
        console.log("Service", url, "published", hash);
        socket.lastHash = hash;
      }
    }
  }
}
