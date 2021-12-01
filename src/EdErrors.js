export class CommandNotFoundError extends Error {
  constructor(input) {
    super(`No command found for input "${input}"`);
    this.name = 'CommandNotFoundError';
  }
}
export class CommandParseError extends Error {
  constructor(input, command) {
    super(`Input "${input}" is invalid for command "${command}"`);
    this.name = 'CommandParseError';
  }
}
export class ZeroAddressingError extends Error {
  constructor() {
    super(`0 only valid for append (a) and read (r) commands`);
    this.name = 'ZeroAddressingError';
  }
}
export class BufferBoundsError extends Error {
  constructor(address, bufferLength) {
    const adjustedBufferLength = parseInt(bufferLength) -1;
    super(`Cannot access address "${address}" of buffer length "${adjustedBufferLength}"`);
    this.name = 'BufferBoundsError';
  }
}
export class AddressOrderError extends Error {
  constructor(addressOne, addressTwo) {
    super(
      `New address "${addressOne}" cannot be less than previous address "${addressTwo}"`
    );
    this.name = 'AddressOrderError';
  }
}
export class AddressParserError extends Error {
  constructor(input) {
    super(`"${input}" is not a valid address`);
    this.name = 'AddressParserError';
  }
}

export class AddressSearchError extends Error {
  constructor(input = 'no search term') {
    super(`Failed to match "${input}"`);
    this.name = 'AddressSearchError';
  }
}
export class EmptyBufferError extends Error {
  constructor(command) {
    super(`The buffer is empty, cannot execute command "${command}"`);
    this.name = 'EmptyBufferError';
  }
}

export class StorageError extends Error {
  constructor() {
    super(`Cannot access local storage`);
    this.name = 'StorageError';
  }
}

export class FileReadError extends Error {
  constructor(file) {
    super(`Cannot read file ${file}`);
    this.name = 'FileReadError';
  }
}

export class EmptyRegexError extends Error {
  constructor() {
    super(`No regex to use for search`);
    this.name = 'EmptyRegexError';
  }
}

export class MatchError extends Error {
  constructor(match) {
    super(`Failed to match ${match} on all addressed lines`);
    this.name = 'MatchError';
  }
}

export class CommandRestrictedError extends Error {
  constructor(command) {
    super(
      `Command '${command}' is currently restricted under global execution`
    );
    this.name = 'CommandRestrictedError';
  }
}
