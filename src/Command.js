import {
  CommandNotFoundError,
  CommandParseError,
  EmptyBufferError,
  EmptyRegexError,
  FileReadError,
  MatchError,
  StorageError,
  BufferBoundsError,
} from './EdErrors.js';

export function incrementPrint(state) {
  if (state.currentAddress < state.buffer.length - 1) {
    const newCurrentAddress = state.currentAddress + 1;
    const { output, currentAddress } = print({
      ...state,
      currentAddress: newCurrentAddress,
    });
    return { output, currentAddress };
  } else {
    throw new BufferBoundsError(
      state.currentAddress + 1,
      state.buffer.length - 1
    );
  }
}
export function getAddress(
  address,
  currentAddress,
  zero = true,
  fallback = [currentAddress, currentAddress]
) {
  if (address.length > 0) {
    if (zero && address.length > 1) {
      if (
        address[address.length - 2] === 0 ||
        address[address.length - 1] === 0
      ) {
        throw new ZeroAddressingError();
      }
      return [address[address.length - 2], address[address.length - 1]];
    } else if (zero) {
      if (address[0] === 0) {
        throw new ZeroAddressingError();
      }
      return [address[0], address[0]];
    } else {
      return [address[address.length - 1], address[address.length - 1]];
    }
  }
  return fallback;
}

export function print(
  { address, buffer, currentAddress, output },
  list = false
) {
  const newOutput = [...output];
  if (!currentAddress) {
    throw new EmptyBufferError('print');
  }
  let [fromAddress, toAddress] = getAddress(address, currentAddress);
  if (list) {
    for (let i = fromAddress; i <= toAddress; i++) {
      newOutput.push(buffer[i] + '$');
    }
  } else {
    for (let i = fromAddress; i <= toAddress; i++) {
      newOutput.push(buffer[i]);
    }
  }
  currentAddress = toAddress;
  return { output: newOutput, currentAddress };
}
export function equals({ address, buffer }) {
  const equalsAddress = getAddress(address, buffer.length - 1);
  return equalsAddress[1];
}
export function deleteLine({ buffer, address, currentAddress }) {
  if (!currentAddress) {
    throw new EmptyBufferError('delete');
  }
  const newBuffer = [...buffer];
  const addresses = getAddress(address, currentAddress);
  newBuffer.splice(addresses[0], addresses[1] - addresses[0] + 1);
  if (newBuffer.length === 1) {
    currentAddress = 0;
  } else {
    if (addresses[1] === buffer.length - 1) {
      currentAddress = addresses[0] - 1;
    } else {
      currentAddress = addresses[0];
    }
  }
  return { buffer: newBuffer, currentAddress };
}
export function input(
  { buffer, input, currentAddress, address },
  inputMode = 0
) {
  if (input && input.trim() !== 'p') {
    throw new CommandParseError(input.trim(), 'insert');
  }
  if (inputMode) {
    let _;
    [_, currentAddress] = getAddress(address, currentAddress, false);
    currentAddress += 1;
  } else {
    let _;
    [_, currentAddress] = getAddress(address, currentAddress);
    if (buffer.length === 1 && !currentAddress) {
      //allow insert on empty buffer with no address
      currentAddress = 1;
    }
  }
  const mode = 'input';
  const backup = input;
  input = '';
  return { currentAddress, backup, mode, input };
}
export function global({ input, address, buffer, currentAddress, regex }) {
  const marks = [];
  if (input[0] === '/') {
    let re = /^(\/.*?(?<!\\)\/)/;
    let regexResult = input.match(re)[0].slice(1, -1);
    const command = input.slice(regexResult.length + 2);
    let newRegex;
    if (regexResult === '') {
      newRegex = new RegExp(regex);
    } else {
      newRegex = new RegExp(regexResult);
      regex = regexResult;
    }
    let start;
    let end;
    [start, end] = getAddress(address, currentAddress, true, [
      1,
      buffer.length - 1,
    ]);

    for (let i = start; i <= end; i++) {
      let m = newRegex.exec(buffer[i]);
      if (m) {
        marks.push(i);
      }
    }
    if (!marks[0]) {
      throw new MatchError(regexResult);
    } else {
      let mode = 'global';
      return {
        input: command,
        mode,
        marks,
        regex,
        restrictions: ['append', 'change', 'insert'],
      };
    }
  } else throw new CommandParseError(input, 'global');
}
export function substitute({ input, address, buffer, currentAddress, regex }) {
  const re =
    /^([^ ]{1})(?<first>.*?)(?<!\\)\1(?<second>.*?)(?<!\\)\1(?<remaining>.*?)$/;
  const match = re.exec(input);
  let newFirst;
  if (match === null) {
    throw new CommandParseError(input, 'substitute');
  }
  if (!match?.groups?.first) {
    if (match.groups.first === '') {
      newFirst = regex;
    } else throw new EmptyRegexError();
  } else {
    newFirst = match.groups.first;
    regex = newFirst;
  }

  if (match?.groups?.second) {
    const second = match.groups.second.replace(/(?<!\\)&/, newFirst);
    let addresses = getAddress(address, currentAddress);
    const newBuffer = [...buffer];
    let fail = true;
    const first = RegExp(newFirst);
    for (let i = addresses[0]; i <= addresses[1]; i++) {
      if (first.exec(newBuffer[i])) {
        let replacement = newBuffer[i].replace(first, second);
        fail = false;
        newBuffer.splice(i, 1, replacement);
        currentAddress = i;
      }
    }
    if (fail) {
      throw new MatchError(first);
    } else {
      let newInput;
      if (match.groups?.remaining?.length > 0) {
        newInput = input.slice(-match.groups?.remaining?.length);
      } else {
        newInput = '';
      }
      return { buffer: newBuffer, currentAddress, input: newInput, regex };
    }
  }
  //  }
}
export function write({
  input,
  filename,
  buffer,
  output,
  address,
  currentAddress,
}) {
  if (typeof Storage !== 'undefined') {
    const [fromAddress, toAddress] = getAddress(address, currentAddress, true, [
      1,
      buffer.length - 1,
    ]);
    const filenameInput = input.trim();
    if (filenameInput) {
      localStorage.setItem(
        filenameInput,
        JSON.stringify(buffer.slice(fromAddress, toAddress + 1))
      );
      const newOutput = [...output];
      newOutput.push(
        buffer
          .slice(fromAddress, toAddress + 1)
          .reduce((total, line) => total + line.length, 0)
          .toString()
      );
      return { output: newOutput, filename: filenameInput };
    } else {
      if (filename) {
        localStorage.setItem(
          filename,
          JSON.stringify(buffer.slice(fromAddress, toAddress + 1))
        );
        const newOutput = [...output];
        newOutput.push(
          buffer
            .slice(fromAddress, toAddress + 1)
            .reduce((total, line) => total + line.length, 0)
            .toString()
        );
        output = [...output, newOutput];
        return { output: newOutput, filename: filenameInput };
      } else throw new CommandParseError('', 'write');
    }
  } else {
    throw new StorageError();
  }
}
export function read({ input, address, buffer, currentAddress, output }) {
  if (typeof Storage !== undefined) {
    const filenameInput = input.trim();
    if (filenameInput) {
      let file = [];
      try {
        file = JSON.parse(localStorage.getItem(filenameInput));
      } catch (e) {
        throw new FileReadError(filenameInput);
      }
      if (!file) {
        throw new FileReadError(filenameInput);
      }
      const newBuffer = [...buffer];
      const [addressFrom, addressTo] = getAddress(
        address,
        currentAddress,
        false,
        [0, buffer.length - 1]
      );
      let newCurrentAddress = addressTo;
      newBuffer.splice(newCurrentAddress + 1, 0, ...file);
      newCurrentAddress += file.length;
      const newOutput = [...output];
      newOutput.push(
        file.reduce((total, line) => total + line.length, 0).toString()
      );
      return {
        currentAddress: newCurrentAddress,
        output: newOutput,
        buffer: newBuffer,
        filename: filenameInput,
      };
    } else {
      if (filename) {
        let file = [];
        try {
          file = JSON.parse(localStorage.getItem(filename));
        } catch (e) {
          throw new FileReadError(filename);
        }
        const newBuffer = [...buffer];
        const [_, addressTo] = getAddress(address, currentAddress, false, [
          0,
          buffer.length - 1,
        ]);
        let newCurrentAddress = addressTo;
        newBuffer.splice(newCurrentAddress + 1, 0, ...file);
        newCurrentAddress += file.length;
        const newOutput = [...output];
        newOutput.push(
          file.reduce((total, line) => total + line.length, 0).toString()
        );
        return {
          currentAddress: newCurrentAddress,
          output: newOutput,
          buffer: newBuffer,
          filename,
        };
      } else throw new CommandParseError(' ', 'read');
    }
  } else {
    throw new StorageError();
  }
}
