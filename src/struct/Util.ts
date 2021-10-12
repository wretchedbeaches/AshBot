export function isPromise(value: any): boolean {
	return value !== null && value !== undefined && typeof value.then === 'function' && typeof value.catch === 'function';
}

export const CommandHandlerEvents = {
	COMMAND_BLOCKED: 'blocked',
	ENDED: 'ended',
	COMMAND_ERROR: 'error',
	STARTED: 'started',
	COMMAND_API_ERROR: 'commandApiError',
};

export const CooldownManagerEvents = {
	COOLDOWN: 'cooldown',
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
	INVALID_CLASS_TO_HANDLE: (given: string, expected: string) =>
		`Class to handle ${given} is not a subclass of ${expected}`,

	// Generic errors
	NOT_INSTANTIABLE: (constructor: string) => `${constructor} is not instantiable`,
	NOT_IMPLEMENTED: (constructor: string, method: string) => `${constructor}#${method} has not been implemented`,
	INVALID_TYPE: (name: string, expected: string, vowel = false) =>
		`Value of '${name}' was not ${vowel ? 'an' : 'a'} ${expected}`,
};
