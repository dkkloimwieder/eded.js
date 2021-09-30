import * as Command from './Command.js';
import { CommandNotFoundError } from './EdErrors.js';

export class CommandFSM {
  status = 'initial';
  static mapping = {
    a: 'append',
    c: 'change',
    d: 'delete',
    e: 'edit',
    '=': 'equals',
    g: 'global',
    i: 'insert',
    l: 'list',
    p: 'print',
    q: 'quit',
    r: 'read',
    s: 'substitute',
    w: 'write',
  };
  static commandMap(currentStatus, input) {
    if (input && input[0]) {
      const command = CommandFSM.mapping[input[0]];
      if (CommandFSM[currentStatus].hasOwnProperty(command)) {
        let newInput = input.slice(1);
        return [command, newInput];
      } else {
        throw new CommandNotFoundError(input);
      }
    } else {
      return ['end', ''];
    }
  }
  static initial = {
    end: {
      next(state) {
        if (state.address[0]) {
          const newCurrentAddress = state.address[0];
          return { ...state, currentAddress: newCurrentAddress, address: [] };
        } else {
          const { output, currentAddress } = Command.incrementPrint(state);
          return { ...state, output, currentAddress, address: [] };
        }
      },
    },

    quit: {
      next(state) {
        const { buffer, currentAddress } = Command.deleteLine({
          ...state,
          address: [1, state.buffer.length],
        });
        return {
          ...state,
          buffer,
          currentAddress,
          address: [],
          output: ['goodbye'],
        };
      },
    },
    print: {
      next(state) {
        const { output, currentAddress } = Command.print(state);
        return { ...state, output, currentAddress, address: [] };
      },
    },
    list: {
      next(state) {
        const { output, currentAddress } = Command.print(state, true);
        return { ...state, output, currentAddress, address: [] };
      },
    },
    equals: {
      next(state) {
        const newOutput = Command.equals(state);
        return { ...state, output: [...state.output, newOutput], address: [] };
      },
    },
    delete: {
      next(state) {
        const { buffer, currentAddress } = Command.deleteLine(state);
        return { ...state, buffer, currentAddress, address: [] };
      },
    },
    append: {
      next(state) {
        const { currentAddress, backup, input, mode } = Command.input(state, 1);
        return { ...state, currentAddress, backup, input, mode, address: [] };
      },
    },
    insert: {
      next(state) {
        const { currentAddress, backup, input, mode } = Command.input(state, 0);
        return { ...state, currentAddress, backup, input, mode, address: [] };
      },
    },
    change: {
      next(state) {
        const deleteState = Command.deleteLine(state);
        const { currentAddress, backup, input, mode } = Command.input(
          { ...state, ...deleteState, address: [] },
          0
        );
        return {
          ...state,
          currentAddress,
          backup,
          input,
          mode,
          address: [],
          buffer: deleteState.buffer,
        };
      },
    },
    read: {
      next(state) {
        const { buffer, currentAddress, output, filename } =
          Command.read(state);
        return {
          ...state,
          buffer,
          currentAddress,
          output,
          filename,
          input: '',
          address: [],
        };
      },
    },
    write: {
      next(state) {
        const { output, filename } = Command.write(state);
        return { ...state, output, filename, address: [], input: '' };
      },
    },
    edit: {
      next(state) {
        const { buffer, currentAddress, output, filename } = Command.read({
          ...state,
          buffer: ['nope'],
          currentAddress: 0,
        });
        return {
          ...state,
          buffer,
          currentAddress,
          output,
          filename,
          input: '',
        };
      },
    },
    global: {
      next(state) {
        const { input, mode, marks, regex } = Command.global(state);
        return { ...state, input, mode, marks, regex, address: [] };
      },
    },
    substitute: {
      next(state) {
        const { buffer, currentAddress, input, regex } =
          Command.substitute(state);
        return { ...state, buffer, currentAddress, input, address: [], regex };
      },
    },
  };
  static end = {};
  static quit = {
    end: {
      next(state) {
        return state;
      },
    },
  };
  static print = {
    end: {
      next(state) {
        return state;
      },
    },
  };
  static list = {
    end: {
      next(state) {
        return state;
      },
    },
  };
  static equals = {
    end: {
      next(state) {
        return state;
      },
    },
    print: {
      next(state) {
        const { output, currentAddress } = Command.print(state);
        return { ...state, output, currentAddress, address: [] };
      },
    },
  };
  static delete = {
    end: {
      next(state) {
        return state;
      },
    },
  };
  static append = {
    end: {
      next(state) {
        return state;
      },
    },
  };
  static insert = {
    end: {
      next(state) {
        return state;
      },
    },
  };
  static change = {
    end: {
      next(state) {
        return state;
      },
    },
  };
  static read = {
    end: {
      next(state) {
        return state;
      },
    },
    print: {
      next(state) {
        const { output, currentAddress } = Command.print(state);
        return { ...state, output, currentAddress, address: [] };
      },
    },
  };
  static write = {
    end: {
      next(state) {
        return state;
      },
    },
    print: {
      next(state) {
        const { output, currentAddress } = Command.print(state);
        return { ...state, output, currentAddress, address: [] };
      },
    },
  };
  static edit = {
    end: {
      next(state) {
        return state;
      },
    },
    print: {
      next(state) {
        const { output, currentAddress } = Command.print(state);
        return { ...state, output, currentAddress, address: [] };
      },
    },
  };
  static global = {
    end: {
      next(state) {
        return state;
      },
    },
  };
  static substitute = {
    end: {
      next(state) {
        return state;
      },
    },
    print: {
      next(state) {
        const { output, currentAddress } = Command.print(state);
        return { ...state, output, currentAddress, address: [] };
      },
    },
  };
}
