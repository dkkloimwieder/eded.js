# Ed Education in Javascript

 `yarn install && yarn start` to run in your browser via `http-server`

---

This is an implementation of ed from UNIX version 1 in javascript. Notable differences include the lack of the `!` command to access the shell, the addition of full javascript regular expressions, and the addition of verbose error messages that are included under the input. Reading (`r` and `e`) and writing (`w`) are implemented via local storage in the browser. If local storage is not enabled eded will not read or write files. 

The original man page can be found at [cat-v.org](http://man.cat-v.org/unix-1st/1/ed)

Notable differences of the first version of ed from its more modern successors are the lack of marks, moves, and the inability to use input commands (`a`, `i`, and `c`) in a global (`g`) context. Substitute (`s`) does not take an appended global (`g`) flag and stops at the first match found. Additionally there were no default open ranges (lone `,` or `;`), although addresses can be totally omitted and the defaults (`.` for most commands) will still apply. 

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