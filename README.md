# Ed Editor V1 Javascript Edition

 `yarn install && yarn start` to run in your browser via `http-server`

---

This is an implementation of ed from UNIX version 1 in javascript. Notable differences include the lack of the `!` command to access the shell, the addition of full javascript regular expressions, and the addition of verbose error messages that are included under the input. Reading (`r` and `e`) and writing (`w`) are implemented via local storage in the browser. If local storage is not enabled eded will not read or write files. 

The original man page can be found at [cat-v.org](http://man.cat-v.org/unix-1st/1/ed)

Notable differences of the first version of ed from its more modern successors are the lack of marks, moves, and the inability to use input commands (`a`, `i`, and `c`) in a global (`g`) context. Substitute (`s`) does not take an appended global (`g`) flag and stops at the first match found. Global does not make use of multiline, backslash delimited, commands. Additionally there are no default open ranges (lone `,` or `;`), although addresses can be totally omitted and the defaults (`.` for most commands) will still apply.

A live version  can be found running at [dkkloimwieder.com](https://dkkloimwieder.com/eded)

Additional Resources
***

## Ed and Unix Resources

### Tutorial

[PDF](https://www.nyx.net/~ewilli/edtut.pdf) - A short tutorial which concisely covers the operation of ed by Brian Kernighan

### Man pages through the years

[bell-labs](https://www.bell-labs.com/usr/dmr/www/1stEdman.html) - Scanned man pages from UNIX version 1 from Dennis M. Ritchie.

[cat-v](http://doc.cat-v.org/unix/v0/) - Not really man pages but a very early description of the operation and usage of UNIX (version 0). A brief description of ed is included. There are tons of great resources and documentation on cat-v.org in general.

[OpenBSD](https://man.openbsd.org/ed.1) - OpenBSD's modern ed.

[GNU](https://www.gnu.org/software/ed/manual/ed_manual.html) - Gnu's modern ed.

[IBM](https://www.ibm.com/docs/en/aix/7.1?topic=e-ed-command) - IBM AIX ed. This is probably the best documentation of a modern ed variant.  

### Source

[ed V6 source](https://github.com/geocar/ed-v6) - Source from UNIX V6 of ed ported to compile on modern systems. V6 was the first version of ed written in c.

[ed V10](https://www.cs.princeton.edu/courses/archive/spring01/cs333/grep.html) - Brian Kernighans cs333 assignment to build grep from ed, with V10 source included.

### Books

[Software Tools in Pascal](https://openlibrary.org/books/OL4258115M/Software_tools_in_Pascal) - Most modern eds reference the implementation descibed in this book by Plauger and Kernighan.

### Emulators

[UNIX V1](https://github.com/jserv/unix-v1) - UNIX v1 source to be run on an emulator

[pdp11](https://skn.noip.me/pdp11/pdp11.html) - PDP11 emulator in javascript.

[pdp11](https://pdp11.aiju.de/) - Another PDP11 emulator in javascript.

## Notes on Design

Eded should very much be considered a work in progress. It's development has primarily been an educational activity
in javascript. The current version is the most functional (as in "working", not the programming paradigm), but the 
is in various states of refactoring and needs a thorough power washing. Below is a brief list of approaches I considered:

- Huge switch statement and lots of static methods and lots of flags - This was my intitial approach and after having the chance to look at actual ed.c source appears to be the preferred method. Not very javascript and not very useful for my education.

- Regex - Parsing ed's input can (mostly) be parsed/executed with modern regex. This seemed appropriated as Ken Thompson is largely responsible for the development and subsequent popularity of regular expressions in software development. Essentially the addressing, command,
and optional print sections of ed's input can be pulled apart into capture groups using lots of lookbehind/lookahead. It ends up looking very much like an obfuscated perl competition and is not maintainable or extensible. It was; however, quite a bit of fun. There are bits of this approach left in the current version. 

-Finite State Machines - The current version of eded essentially uses two FSM to parse input. The first is for addressing and the second for commands. It is a very boilerplatey approach, although I suspect I am missing some simple that might make life a little easier. The "command" FSM does next to nothing as most commands primarily just terminate after a single function call, but the hope is that is that this approach is much more flexible if eded was to be expanded (marks, moves, and multiline commands should be trivial to implement with the current architecture). The global command is implemented as a recursive call on each line that matched. The matched line array is then reconciled in the case of additions or deletions. Input (append, insert, change) has been pulled out of the FSM, as I initally thought this would be required for interacting with the user. That is not the case. Eded passes a copy of state to pass through the FSM, throws on error, and simply reverts to the orignal state as neccesary. This is somewhat in line with the original input parsing of ed. The entire line would be parsed before it was executed (source needed).  

- Miscellaneous - Passing around functions instead of passing around state was considered. The use of classes vs regular objects vs modules is somewhat haphazard in the current version. I am still unsure as to the final route that should be taken. The code obviously needs more modularity and consistency; Hopefully in the near future. Eded is MIT licensed.
