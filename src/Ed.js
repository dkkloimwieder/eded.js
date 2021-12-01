import { AddressParser } from './AddressFSM.js';
import { ZeroAddressingError } from './EdErrors.js';
import { CommandFSM } from './CommandFSM.js';

export class Ed {
  state = {
    regex: 'ed',
    filename: '',
    status: 'initial',
    address: [],
    currentAddress: 1,
    input: '',
    mode: 'command',
    marks: null,
    buffer: ['nope', 'hello', 'from', 'ed', 'ed!'], //"nope" so address 1 == buffer[1]
    output: [],
    backup: [],
    restrictions: null,
  };

  execute(state) {
    if (!state.marks) {
      const addressedState = AddressParser.buildAddress(state); //AddressFSM.AddressParser.
      let current = { ...state, ...addressedState };
      let next = {};
      current.status = 'initial';
      do {
        let [nextStatus, input] = CommandFSM.commandMap(
          current.status,
          current.input
        );
        if (current.restrictions && current.restrictions.includes(nextStatus)) {
          throw new CommandRestrictedError(nextStatus);
        }
        current.input = input;
        next = CommandFSM[current.status][nextStatus].next(current);
        current = { ...next };
        current.status = nextStatus;
      } while (current.status !== 'end' && current.status !== 'global');
      return current;
    } else {
      let globalMarks = [...state.marks];
      let bufferLength = state.buffer.length;
      let input = state.input;
      let globalState = { ...state };
      globalState.marks = null;
      let markIndex = 0;
      while (markIndex < globalMarks.length) {
        globalState.input = input;
        globalState.currentAddress = globalMarks[markIndex];
        let nextState;

        do {
          nextState = this.execute(globalState);
          globalState = { ...globalState, ...nextState };
        } while (globalState.input);
        if (bufferLength > globalState.buffer.length) {
          let deleteLines = bufferLength - globalState.buffer.length;
          bufferLength = globalState.buffer.length;
          globalMarks = globalMarks.map((mark) =>
            mark > globalState.currentAddress ? (mark -= deleteLines) : mark
          );
        }
        if (bufferLength < globalState.buffer.length) {
          let addedLines = globalState.buffer.length - bufferLength;
          bufferLength = globalState.buffer.length;
          if (globalState.address.length !== 0) {
            globalMarks = globalMarks.map((mark) =>
              mark > globalState.address[globalState.address.length - 1]
                ? (mark += addedLines)
                : mark
            );
          } else {
            globalMarks = globalMarks.map((mark) =>
              mark > globalState.currentAddress ? (mark += addedLines) : mark
            );
          }
        }
        globalState.address = [];
        markIndex++;
      }
      return globalState;
    }
  }

  edit(input) {
    if (input === '.') {
      this.state.mode = 'command';
      this.state.currentAddress--;
      if (this.state.backup) {
        const prevInput = this.state.backup;
        this.state.backup = '';
        const output = this.readLine(prevInput);

        return output;
      } else return { explanation: null, lines: [] };
    } else {
      this.state.buffer.splice(this.state.currentAddress, 0, input);
      this.state.currentAddress++;
      return { explanation: null, lines: [] };
    }
  }
  readLine(input) {
    if (this.state.mode == 'input') {
      return this.edit(input);
    } else {
      this.state.input = input.trim();
      let next = {};
      do {
        try {
          next = this.execute(this.state);
        } catch (e) {
          this.state = {
            ...this.state,
            marks: null,
            restrictions: null,
            address: [],
            input: '',
            status: 'initial',
          };
          return { explanation: `${e.name}: ${e.message}`, lines: '?' };
        }
        this.state = { ...this.state, ...next };
      } while (this.state.input);
      let output = { explanation: null, lines: this.state.output };
      this.state.output = [];
      this.state.address = [];
      return output;
    }
  }
}
