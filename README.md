# whathappened

[![NPM version](https://badge.fury.io/js/whathappened.svg)](http://badge.fury.io/js/whathappened)
[![Build Status](https://travis-ci.org/enobufs/whathappened.svg?branch=master)](https://travis-ci.org/enobufs/whathappened)

List up recently updated modules that are in the node module tree in your project.

## Why you would use this?
During development, you may have come across a situation where even though you never changed your code, your application suddenly stopped working correctly. This is likely due to a change in one of your projects dependencies. This tool will help you listing up modules that are recently changed in chronological order so that you could quickly identify a change that may have caused the problem.


## System Requirement
* Node: >= 4.0.0

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
$ whathappened
Sun Aug 24 2014 00:50:32 GMT-0700 (PDT): js-yaml 3.1.0->3.2.0, whathappened@0.0.2:istanbul@0.3.2:js-yaml@3.2.1
Sun Aug 24 2014 01:05:01 GMT-0700 (PDT): js-yaml 3.2.0->3.2.1, whathappened@0.0.2:istanbul@0.3.2:js-yaml@3.2.1
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
    * {array} results - List of items each of which has following properties:
        * {number} date - time (in msec UTC) when this item was updated.
        * {string} ver - The version that was released on the `date`
        * {string} prev - The previous version. This may be null when the previous version is not available.
        * {string} path - Full path to the module delimited by ':' 
