export const ModuleType = {
  ADDON: "Addon",
  EXTENSION: "Extension",
  KERNEL: "Kernel",
};

/**
 * Represents a module.
 * @class
 */
export default class Module {
  id = null;
  name = "";
  type = null;
  version = null;
  description = "";
  installationGuide = "";
  defaultEnvironmentVariables = {
    AGENT_URLS: {
      defaultValue: "ws://talkops",
      possibleValues: ["ws://talkops1", "ws://talkops2"],
      description:
        "A comma-separated list of WebSocket server URLs for real-time communication with specified agents.",
    },
  };
  mandatoryEnvironmentVariables = {};
  environmentVariables = this.defaultEnvironmentVariables;
  dockerRepository = "";
  dockerVolumeData = null;
  errors = [];

  constructor(name, type) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error("name is required and must be a non-empty string.");
    }
    if (!Object.values(ModuleType).includes(type)) {
      const moduleTypeValues = Object.values(ModuleType).join(", ");
      throw new Error(
        `type is required and must be a one of the following values: ${moduleTypeValues}.`
      );
    }
    this.id = name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^\w_]+/g, "")
      .replace(/_{2,}/g, "_")
      .trim("_");
    this.name = name;
    this.type = type;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      version: this.version,
      errors: this.errors,
    };
  }

  /**
   * @param {string} version - The version of the module.
   */
  setVersion(version) {
    this.version = version;
  }

  /**
   * @param {string} description - The description of the module.
   */
  setDescription(description) {
    this.description = description;
  }

  /**
   * @param {string} installationGuide - The installation guide of the module.
   */
  setInstallationGuide(installationGuide) {
    this.installationGuide = installationGuide;
  }

  /**
   * @param {array} environmentVariables - The environment variables of the extension.
   */
  setEnvironmentVariables(environmentVariables) {
    this.environmentVariables = {};
    for (const name in environmentVariables) {
      this.environmentVariables[name] = environmentVariables[name];
    }
    for (const name in this.defaultEnvironmentVariables) {
      this.environmentVariables[name] = this.defaultEnvironmentVariables[name];
    }
    for (const name in this.environmentVariables) {
      const props = this.environmentVariables[name];
      if (props.defaultValue) {
        if (process.env[name] === undefined) {
          process.env[name] = props.defaultValue;
        }
      } else {
        this.mandatoryEnvironmentVariables[name] = props;
      }
    }
    for (const name in this.environmentVariables) {
      const props = this.environmentVariables[name];
      if (props.defaultValue === undefined && process.env[name] === undefined) {
        this.errors.push(`The environment variable ${name} is required.`);
      }
      if (props.availableValues !== undefined) {
        if (!props.availableValues.includes(process.env[name])) {
          this.errors.push(
            `The environment variable ${name} must be one of the following values: ${props.availableValues.join(
              ", "
            )}.`
          );
        }
      }
      if (props.validation !== undefined) {
        if (!props.validation(process.env[name])) {
          this.errors.push(`The environment variable ${name} is invalid.`);
        }
      }
    }
  }

  /**
   * @param {string} dockerRepository - The docker repository of the extension.
   */
  setDockerRepository(dockerRepository) {
    this.dockerRepository = dockerRepository;
  }

  /**
   * @param {string} dockerVolumeData - The docker volume data of the extension.
   */
  setDockerVolumeData(dockerVolumeData) {
    this.dockerVolumeData = dockerVolumeData;
  }

  async resolve(arg) {
    if (arg === undefined) return undefined;
    if (arg.constructor.name === "AsyncFunction") {
      arg = await arg();
    } else if (arg.constructor.name === "Function") {
      arg = arg();
    }
    return arg;
  }
  async resolveToArray(arg) {
    if (arg === undefined) return [];
    arg = await this.resolve(arg);
    return Array(arg);
  }
  async resolveToBoolean(arg) {
    if (arg === undefined) return false;
    arg = await this.resolve(arg);
    return Boolean(arg);
  }
  async resolveToNumber(arg) {
    if (arg === undefined) return 0;
    arg = await this.resolve(arg);
    return Number(arg);
  }
  async resolveToString(arg) {
    if (arg === undefined) return "";
    arg = await this.resolve(arg);
    if (arg.constructor.name === "Array") {
      arg = arg.join("\n");
    }
    return String(arg).trim();
  }
}
