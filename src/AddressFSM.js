import {
  AddressParserError,
  AddressSearchError,
  AddressOrderError,
  BufferBoundsError,
} from './EdErrors.js';

export class AddressParser {
  static validateAddress({ address, buffer }, tmpAddress) {
    if (tmpAddress < buffer.length && tmpAddress >= 0) {
      if (address !== []) {
        if (tmpAddress < address[address.length - 1]) {
          throw new AddressOrderError(tmpAddress, address[address.length - 1]);
        }
      }
      return true;
    } else {
      throw new BufferBoundsError(address, buffer.length);
    }
  }
  static parseDigits(index, input) {
    let tmpAddress = '';
    do {
      tmpAddress += input.charAt(index++);
    } while (index < input.length && Number.isInteger(parseInt(input[index])));
    return [{}, parseInt(tmpAddress), index];
  }
  static incrementIndex({}, tmpAddress, index) {
    index += 1;
    return [{}, tmpAddress, index];
  }
  static dot({ currentAddress }, tmpAddress, index) {
    index += 1;
    tmpAddress = currentAddress;
    return [{}, tmpAddress, index];
  }
  static dollar({ buffer }, tmpAddress, index) {
    index += 1;
    tmpAddress = buffer.length - 1;
    return [{}, tmpAddress, index];
  }

  static semicolon({ address, buffer }, tmpAddress, index) {
    index = index + 1;
    if (AddressParser.validateAddress({ address, buffer }, tmpAddress)) {
      const newAddress = [...address];
      newAddress.push(tmpAddress);
      let currentAddress = tmpAddress;
      return [{ address: newAddress, currentAddress }, 0, index];
    } else throw new AddressParserError(tmpAddress);
  }
  static comma({ address, buffer }, tmpAddress, index) {
    index = index + 1;
    if (AddressParser.validateAddress({ address, buffer }, tmpAddress)) {
      const newAddress = [...address];
      newAddress.push(tmpAddress);
      return [{ address: newAddress }, 0, index];
    } else throw new AddressParserError(tmpAddress);
  }
  static endAddress({ address, buffer }, tmpAddress, index) {
    if (tmpAddress === null) {
      return [{ address: [] }, 0, 0];
    } else if (AddressParser.validateAddress({ address, buffer }, tmpAddress)) {
      const newAddress = [...address];
      newAddress.push(tmpAddress);
      return [{ address: newAddress }, 0, index];
    } else throw new AddressParserError(tmpAddress);
  }

  static math({ input }, tmpAddress, index, sign) {
    let addend;
    [{}, addend, index] = AddressParser.parseDigits(index, input);
    tmpAddress = parseInt(addend) * sign + parseInt(tmpAddress);
    return [{}, tmpAddress, index];
  }
  static slash({ input, buffer, currentAddress, regex }, tmpAddress, index) {
    let searchTerm;
    if (input.slice(index, index + 2) === '//') {
      searchTerm = regex;
    } else {
      const slashEscaper = /^(\/.*?(?<!\\)\/)/;
      const regexInput = input.slice(index);
      searchTerm = regexInput.match(slashEscaper)[0].slice(1, -1);
    }
    if (searchTerm) {
      const newRegex = new RegExp(searchTerm);
      for (
        let i = currentAddress + 1;
        i < currentAddress + buffer.length;
        i++
      ) {
        let iAdjusted = i % buffer.length;
        if (!iAdjusted) continue;
        let match = newRegex.exec(buffer[iAdjusted]);
        if (match) {
          tmpAddress = iAdjusted;
          index += searchTerm !== regex ? searchTerm.length + 2 : 2;
          regex = searchTerm;
          return [{ regex }, tmpAddress, index];
        }
      }
      throw new AddressSearchError(searchTerm);
    } else {
      throw new AddressSearchError(searchTerm);
    }
  }
  static query({ input, buffer, currentAddress, regex }, tmpAddress, index) {
    let searchTerm;
    if (input.slice(index, index + 2) === '??') {
      searchTerm = regex;
    } else {
      const slashEscaper = /^(\?.*?(?<!\\)\?)/;
      const regexInput = input.slice(index);
      searchTerm = regexInput.match(slashEscaper)[0].slice(1, -1);
    }
    if (searchTerm) {
      const newRegex = new RegExp(searchTerm);
      for (
        let i = currentAddress + buffer.length - 1;
        i >= currentAddress;
        i--
      ) {
        let iAdjusted = i % buffer.length;
        if (!iAdjusted) continue;
        let match = newRegex.exec(buffer[iAdjusted]);
        if (match) {
          tmpAddress = iAdjusted;
          index += searchTerm !== regex ? searchTerm.length + 2 : 2;
          return [{ regex }, tmpAddress, index];
        }
      }
      throw new AddressSearchError(searchTerm);
    } else {
      throw new AddressSearchError(searchTerm);
    }
  }

  static buildAddress(state) {
    const machine = new AddressFSM();
    let currentState = { ...state, address: [...state.address] };
    let tmpAddress = null;
    let nextState;
    let index = 0;
    let newIndex;
    do {
      let next = AddressFSM.addressMap[currentState.input[index]] || 'end';
      [nextState, tmpAddress, newIndex] = machine[machine.current][
        next
      ].transition(currentState, tmpAddress, index);
      machine.current = next;
      currentState = { ...currentState, ...nextState };
      index = newIndex;
    } while (machine.current !== 'end');
    currentState.input = currentState.input.slice(index) || '';
    return currentState;
  }
}

export class AddressFSM {
  current = 'initial';
  static addressMap = {
    0: 'digit',
    1: 'digit',
    2: 'digit',
    3: 'digit',
    4: 'digit',
    5: 'digit',
    6: 'digit',
    7: 'digit',
    8: 'digit',
    9: 'digit',
    ',': 'comma',
    ';': 'semicolon',
    '/': 'slash',
    '?': 'query',
    '+': 'plus',
    '-': 'minus',
    '.': 'dot',
    $: 'dollar',
  };

  initial = {
    digit: {
      transition({ input }, tmpAddress, index) {
        return AddressParser.parseDigits(index, input);
      },
    },
    slash: {
      transition({ input, buffer, currentAddress, regex }, tmpAddress, index) {
        return AddressParser.slash(
          { input, buffer, currentAddress, regex },
          tmpAddress,
          index
        );
      },
    },
    query: {
      transition({ input, buffer, currentAddress, regex }, tmpAddress, index) {
        return AddressParser.query(
          { input, buffer, currentAddress, regex },
          tmpAddress,
          index
        );
      },
    },
    dot: {
      transition({ currentAddress }, tmpAddress, index) {
        return AddressParser.dot({ currentAddress }, tmpAddress, index);
      },
    },
    dollar: {
      transition({ buffer }, tmpAddress, index) {
        return AddressParser.dollar({ buffer }, tmpAddress, index);
      },
    },
    end: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.endAddress({ address, buffer }, tmpAddress, index);
      },
    },
  };
  digit = {
    comma: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.comma({ address, buffer }, tmpAddress, index);
      },
    },
    plus: {
      transition({}, tmpAddress, index) {
        return AddressParser.incrementIndex({}, tmpAddress, index);
      },
    },
    minus: {
      transition({}, tmpAddress, index) {
        return AddressParser.incrementIndex({}, tmpAddress, index);
      },
    },
    semicolon: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.semicolon({ address, buffer }, tmpAddress, index);
      },
    },
    end: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.endAddress({ address, buffer }, tmpAddress, index);
      },
    },
  };
  comma = {
    digit: {
      transition({ input }, tmpAddress, index) {
        return AddressParser.parseDigits(index, input);
      },
    },
    slash: {
      transition({ input, buffer, currentAddress, regex }, tmpAddress, index) {
        return AddressParser.slash(
          { input, buffer, currentAddress, regex },
          tmpAddress,
          index
        );
      },
    },
    query: {
      transition({ input, buffer, currentAddress, regex }, tmpAddress, index) {
        return AddressParser.query(
          { input, buffer, currentAddress, regex },
          tmpAddress,
          index
        );
      },
    },
    dot: {
      transition({ currentAddress }, tmpAddress, index) {
        return AddressParser.dot({ currentAddress }, tmpAddress, index);
      },
    },
    dollar: {
      transition({ buffer }, tmpAddress, index) {
        return AddressParser.dollar({ buffer }, tmpAddress, index);
      },
    },
  };
  semicolon = {
    digit: {
      transition({ input }, tmpAddress, index) {
        return AddressParser.parseDigits(index, input);
      },
    },
    slash: {
      transition({ input, buffer, currentAddress, regex }, tmpAddress, index) {
        return AddressParser.slash(
          { input, buffer, currentAddress, regex },
          tmpAddress,
          index
        );
      },
    },
    query: {
      transition({ input, buffer, currentAddress, regex }, tmpAddress, index) {
        return AddressParser.query(
          { input, buffer, currentAddress, regex },
          tmpAddress,
          index
        );
      },
    },
    dot: {
      transition({ currentAddress }, tmpAddress, index) {
        return AddressParser.dot({ currentAddress }, tmpAddress, index);
      },
    },
    dollar: {
      transition({ buffer }, tmpAddress, index) {
        return AddressParser.dollar({ buffer }, tmpAddress, index);
      },
    },
  };
  slash = {
    digit: {
      transition({ input }, tmpAddress, index) {
        return AddressParser.math({ input }, tmpAddress, index, 1);
      },
    },
    comma: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.comma({ address, buffer }, tmpAddress, index);
      },
    },
    semicolon: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.semicolon({ address, buffer }, tmpAddress, index);
      },
    },
    plus: {
      transition({}, tmpAddress, index) {
        return AddressParser.incrementIndex({}, tmpAddress, index);
      },
    },
    minus: {
      transition({}, tmpAddress, index) {
        return AddressParser.incrementIndex({}, tmpAddress, index);
      },
    },
    end: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.endAddress({ address, buffer }, tmpAddress, index);
      },
    },
  };
  query = {
    digit: {
      transition({ input }, tmpAddress, index) {
        return AddressParser.math({ input }, tmpAddress, index, 1);
      },
    },
    comma: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.comma({ address, buffer }, tmpAddress, index);
      },
    },
    semicolon: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.semicolon({ address, buffer }, tmpAddress, index);
      },
    },
    plus: {
      transition({}, tmpAddress, index) {
        return AddressParser.incrementIndex({}, tmpAddress, index);
      },
    },
    minus: {
      transition({ index }, tmpAddress) {
        return AddressParser.incrementIndex({ index }, tmpAddress);
      },
    },
    end: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.endAddress({ address, buffer }, tmpAddress, index);
      },
    },
  };
  plus = {
    digit: {
      transition({ input }, tmpAddress, index) {
        return AddressParser.math({ input }, tmpAddress, index, 1);
      },
    },
  };
  minus = {
    digit: {
      transition({ input }, tmpAddress, index) {
        return AddressParser.math({ input }, tmpAddress, index, -1);
      },
    },
  };
  dot = {
    digit: {
      transition({ input }, tmpAddress, index) {
        return AddressParser.math({ input }, tmpAddress, index, 1);
      },
    },
    comma: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.comma({ address, buffer }, tmpAddress, index);
      },
    },
    semicolon: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.semicolon({ address, buffer }, tmpAddress, index);
      },
    },
    plus: {
      transition({}, tmpAddress, index) {
        return AddressParser.incrementIndex({}, tmpAddress, index);
      },
    },
    minus: {
      transition({}, tmpAddress, index) {
        return AddressParser.incrementIndex({}, tmpAddress, index);
      },
    },
    end: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.endAddress({ address, buffer }, tmpAddress, index);
      },
    },
  };
  dollar = {
    minus: {
      transition({}, tmpAddress, index) {
        return AddressParser.incrementIndex({}, tmpAddress, index);
      },
    },
    comma: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.comma({ address, buffer }, tmpAddress, index);
      },
    },
    semicolon: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.semicolon({ address, buffer }, tmpAddress, index);
      },
    },
    end: {
      transition({ address, buffer }, tmpAddress, index) {
        return AddressParser.endAddress({ address, buffer }, tmpAddress, index);
      },
    },
  };
  end = {};
}
