'use strict';

var sinon = require('sinon');
var async = require('async');
var assert = require('assert');
var wh = require('../..');
var npm = require('npm');
var debug = require('debug')('whathappened');

describe('test01', function () {
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
    before(function () {
        this.sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        this.sandbox.restore();
    });

    it('should return empty result', function (done) {
        var data = {
            name: 'mod1',
            version: '0.0.1',
            path: '.'
        };
        this.sandbox.stub(npm, 'load', function (cb) { cb(); });
        this.sandbox.stub(npm.commands, 'list', function (args, silent, cb) {
            assert(Array.isArray(args));
            assert.equal(args.length, 0);
            assert(silent);
            cb(null, data);
        });
        wh({}, function (err, results) {
            assert.ifError(err);
            assert(Array.isArray(results));
            assert.equal(results.length, 0);
            done();
        });
    });

    it('should fail with NotRootError', function (done) {
        var data = {
            name: 'mod1',
            version: '0.0.1',
            path: './noexist'
        };
        this.sandbox.stub(npm, 'load', function (cb) { cb(); });
        this.sandbox.stub(npm.commands, 'list', function (args, silent, cb) {
            assert(Array.isArray(args));
            assert.equal(args.length, 0);
            assert(silent);
            cb(null, data);
        });
        wh({}, function (err, results) {
            assert(err);
            assert.equal(err.name, 'NotRootError');
            done();
        });
    });

    it('should fail with error from list command', function (done) {
        var data = {
            name: 'mod1',
            version: '0.0.1',
            path: './noexist'
        };
        this.sandbox.stub(npm, 'load', function (cb) { cb(); });
        this.sandbox.stub(npm.commands, 'list', function (args, silent, cb) {
            cb(new Error('fake list error'));
        });
        wh({}, function (err, results) {
            assert(err);
            assert.equal(err.name, 'Error');
            done();
        });
    });
});


