export function isPromise(value: any): boolean {
    return value !== null
      && value !== undefined
      && typeof value.then === 'function'
      && typeof value.catch === 'function';
};

export const CommandHandlerEvents = {
  COMMAND_BLOCKED: 'commandBlocked',
  COOLDOWN: 'cooldown',
  ENDED: 'commandEnded',
  ERROR: 'error',
  STARTED: 'commandStarted',
};

export const BaseHandlerEvents = {
  LOAD: 'load',
  REMOVE: 'remove',
};

export const ErrorMessages = {
  // Module-related
  FILE_NOT_FOUND: (filename: string) => `File '${filename}' not found`,
  MODULE_NOT_FOUND: (constructor: string, id: string) => `${constructor} '${id}' does not exist`,
  ALREADY_LOADED: (constructor: string, id: string) => `${constructor} '${id}' is already loaded`,
  NOT_RELOADABLE: (constructor: string, id: string) => `${constructor} '${id}' is not reloadable`,
  INVALID_CLASS_TO_HANDLE: (given: string, expected: string) => `Class to handle ${given} is not a subclass of ${expected}`,

  // Command-related
  ALIAS_CONFLICT: (alias: string, id: string, conflict: string) => `Alias '${alias}' of '${id}' already exists on '${conflict}'`,

  // Options-related
  COMMAND_UTIL_EXPLICIT: 'The command handler options `handleEdits` and `storeMessages` require the `commandUtil` option to be true',
  UNKNOWN_MATCH_TYPE: match => `Unknown match type '${match}'`,

  // Generic errors
  NOT_INSTANTIABLE: (constructor: string) => `${constructor} is not instantiable`,
  NOT_IMPLEMENTED: (constructor: string, method: string) => `${constructor}#${method} has not been implemented`,
  INVALID_TYPE: (name: string, expected: string, vowel: boolean = false) => `Value of '${name}' was not ${vowel ? 'an' : 'a'} ${expected}`
};