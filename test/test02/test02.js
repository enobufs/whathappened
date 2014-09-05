'use strict';

var sinon = require('sinon');
var async = require('async');
var assert = require('assert');
var wh = require('../..');
var npm = require('npm');
var debug = require('debug')('whathappened');

describe('test02', function () {
    before(function () {
        this.sandbox = sinon.sandbox.create();
        this.npmCmds = npm.commands;
        npm.commands = {
            list: function () {},
            view: function () {}
        };
    });
    after(function () {
        npm.commands = this.npmCmds;
        delete this['npmCmds'];
    });
    afterEach(function () {
        this.sandbox.restore();
    });

    it('should return empty result', function (done) {
        var data = {
            name: 'test02',
            version: '0.0.2',
            path: './test/test02',
            dependencies: {
                mod1: {
                    version: "1.0.2",
                    realPath: __dirname + "/node_modules/mod1"
                },
                mod2: {
                    version: "2.1.9",
                    realPath: __dirname + "/node_modules/mod2"
                },
            }
        };
        this.sandbox.stub(npm, 'load', function (cb) { cb(); });
        this.sandbox.stub(npm.commands, 'list', function (args, silent, cb) {
            assert(Array.isArray(args));
            assert.equal(args.length, 0);
            assert(silent);
            cb(null, data);
        });
        this.sandbox.stub(npm.commands, 'view', function (args, silent, cb) {
            assert(Array.isArray(args));
            assert.equal(args.length, 2);
            var pkg = {};
            if (args[0] === 'mod1@1.0.2') {
                pkg['1.0.2'] = {
                    time: {
                        '1.0.2': '' + new Date()
                    }
                };
            } else if (args[0] === 'mod2@2.1.9') {
                pkg['2.1.9'] = {
                    time: {
                        '2.1.9': '' + new Date()
                    }
                };
            } else {
                cb(new Error('unexpected module name@version'));
                return;
            }
            cb(null, pkg);
        });
        wh.create({}).start(function (err, results) {
            assert.ifError(err);
            assert(Array.isArray(results));
            assert.equal(results.length, 2);
            done();
        });
    });
});


