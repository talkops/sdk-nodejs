export const ModuleType = {
  ADDON: "Addon",
  EXTENSION: "Extension",
  KERNEL: "Kernel",
};

export default class Module {
  name = "";
  type = null;
  version = null;
  description = "";
  installationGuide = "";
  defaultEnvironmentVariables = {
    AGENT_URLS: {
      defaultValue: "ws://talkops",
      possibleValues: ["ws://talkops1", "ws://talkops2"],
      description: "A comma-separated list of WebSocket server URLs for real-time communication with specified agents.",
    },
  };
  mandatoryEnvironmentVariables = {}
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
    this.name = name;
    this.type = type;
  }
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      version: this.version,
      errors: this.errors
    };
  }
  setVersion(version) {
    this.version = version;
  }
  setDescription(description) {
    this.description = description;
  }
  setInstallationGuide(installationGuide) {
    this.installationGuide = installationGuide;
  }
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
        this.mandatoryEnvironmentVariables[name] = props
      }
    }
    for (const name in this.environmentVariables) {
      const props = this.environmentVariables[name];
      if (props.defaultValue === undefined && process.env[name] === undefined) {
        this.errors.push(`The environment variable ${name} is required.`);
      }
      if (props.availableValues !== undefined) {
        if (!props.availableValues.includes(process.env[name])) {
          this.errors.push(`The environment variable ${name} must be one of the following values: ${props.availableValues.join(', ')}.`);
        }
      }
      if (props.validation !== undefined) {
        if (!props.validation(process.env[name])) {
          this.errors.push(`The environment variable ${name} is invalid.`);
        }
      }
    }
  }
  setDockerRepository(dockerRepository) {
    this.dockerRepository = dockerRepository;
  }
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
