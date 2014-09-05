# whathappened
List up recently updated modules that are in the node module tree in your project.

## Why you would use this?
During development, you may have come across a situation where even though you never changed your code, your application suddenly stopped working correctly. This is likely due to a change in one of your projects dependencies. This tool will help you listing up modules that are recently changed in chronological order so that you could quickly identify a change that may have caused the problem.


## Installation
    $ npm install -g whathappened
    
## How to use it
    $ whathappened [-t <days>] [--dev] [-r,--reverse]
    Option:
    -t             Number of days to go back. Defaults to 30 [days]
    --dev          Include devDependencies in the root package.json
    -r, --reverse  Reverse chronological order
    -h, --help     This message

### Output example:

```
$ whathappened -t 7
Fri Aug 29 2014 13:34:11 GMT-0700 (PDT): 2.2.2, express@3.16.10:connect@2.25.10:qs@2.2.2
Fri Aug 29 2014 19:39:34 GMT-0700 (PDT): 1.1.0, express@3.16.10:connect@2.25.10:express-session@1.7.6:uid-safe@1.0.1:mz@1.0.1:native-or-bluebird@1.1.1
Fri Aug 29 2014 19:39:34 GMT-0700 (PDT): 1.1.0, express@3.16.10:connect@2.25.10:csurf@1.4.1:csrf@2.0.1:uid-safe@1.0.1:mz@1.0.1:native-or-bluebird@1.1.1
Fri Aug 29 2014 20:11:49 GMT-0700 (PDT): 1.1.1, express@3.16.10:connect@2.25.10:express-session@1.7.6:uid-safe@1.0.1:mz@1.0.1:native-or-bluebird@1.1.1
Fri Aug 29 2014 20:11:49 GMT-0700 (PDT): 1.1.1, express@3.16.10:connect@2.25.10:csurf@1.4.1:csrf@2.0.1:uid-safe@1.0.1:mz@1.0.1:native-or-bluebird@1.1.1
Fri Aug 29 2014 21:58:59 GMT-0700 (PDT): 1.6.7, express@3.16.10:connect@2.25.10:body-parser@1.6.7
Thu Sep 04 2014 21:50:05 GMT-0700 (PDT): 0.8.5, express@3.16.10:send@0.8.5
Thu Sep 04 2014 22:06:27 GMT-0700 (PDT): 1.5.4, express@3.16.10:connect@2.25.10:serve-static@1.5.4
Thu Sep 04 2014 22:52:18 GMT-0700 (PDT): 2.25.10, express@3.16.10:connect@2.25.10
```

# API
You can use this module directly from your javascript code. Please see ./bin/whathappened.js as an example.

## Module method

* create([options]) - return an instance of WhatHappened.
    * {object} option Following three options are available:
        * {number} option.days - Number of days to go back. Defaults to 30 [days].
        * {boolean} option.dev - Include modules in devDependencies (only for the root package). Defaults to false.
        * {boolean} option.reverse - Return items in reverse chronological order. Defaults to false.

## Instance method

* start(cb) - start listing up modules that satisfy version range in corresponding package.json and that are recently changed. Callback arugments are as following:
    * {Error} err - When an error occurred.
    * {array} results - List of items that describe:
        * {number} date - time (in msec UTC) when this item was updated.
        * {string} ver - The version that was releaced at the `date`
        * {string} path - Full path to the module delimited by ':' 