#!/usr/bin/env node

var wh = require("../index");
var optimist = require('optimist')
    .usage('List up recently updated modules.\nUsage: $0 [-t <days>] [--dev] [-r] [-h,--help]')
    .describe('t', 'Number of days to go back in time')
    .describe('dev', 'Include devDependencies in the root package.json')
    .describe('r', 'Reverse chronological order')
    .describe('h', 'This message')
    .default('t', 30)
    .boolean('dev', false)
    .boolean('r')
    .alias('h', 'help');

var argv = optimist.argv;

if (argv.help) {
    optimist.showHelp();
    process.exit(0);
}

wh({days: argv.d, dev: argv.dev, reverse: argv.r}, function (err, results) {
    if (err) {
        if (err instanceof wh.NotRootError) {
            console.log('Error: ' + err.message);
            console.log('Run this command in the directory where root package.json is present.');
        } else if (err instanceof wh.NotInstalledError) {
            console.log('Error: ' + err.message);
            console.log('Run npm-install first, then try again.');
        } else {
            console.log('Error: process terminated unexpectedly: ' + err.message);
        }
        process.exit(1);
    }
    results.forEach(function (item) {
        console.log(new Date(item.date) + ': ' + item.ver + ', ' + item.path);
    });
    process.exit(0);
});
