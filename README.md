# Ed Education in Javascript

 `yarn install && yarn start` to run in your browser via `http-server`

---

This is an implementation of ed from UNIX version 1 in javascript. Notable differences include the lack of the `!` command to access the shell, the addition of full javascript regular expressions, and the addition of verbose error messages that are included under the input. Reading (r and e) and writing (w) are implemented via local storage in the browser. If local storage is not enabled eded will not read or write files. 

The original man page can be found [here](http://man.cat-v.org/unix-1st/1/ed)

Notable differences of the first version of ed from its more modern successors are the lack of marks, moves, and the inability to use input commands (a, i, and c) in a global (g) context. Substitute (s) does not take an appended global (g) flag and stops at the first match found. Additionally there were no default open ranges (_,_ or _;_). All addressing must be explicit.  

A live version  can be found running at [dkkloimwieder.com](https://dkkloimwider/ed)

Enjoy!
