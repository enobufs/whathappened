'use strict';

var npm = require('npm');
var fs = require('fs');
var util = require('util');
var semver = require('semver');
var async = require('async');
var _und = require('underscore');
var debug = require('debug')('whathappened');

// defaults
var defaults = {
    days: 30,
    dev: false,
    reverse: false
};

////////////////////////////////////////////////////////////////////////////////
// WhatHappened classes

function WhatHappened(option) {
    this._option = _und.defaults(option || {}, defaults);
    this._results = [];
    this._since = Date.now() - this._option.days*24*60*60*1000;
}

WhatHappened.prototype.start = function start(cb) {
    var self = this;
    npm.load(function () {
        npm.commands.list([], true, function (err, data) {
            if (err) {
                debug('Error:', err);
                return void(cb(err));
            }

            try {
                var json = require(data.path + '/package.json');
            } catch (e) {
                return void(cb(new NotRootError(e.message)));
            }

            var module = data.name + '@' + data.version;
            var deps = self._option.dev?(data.devDependencies || {}):{};
            _und.extend(deps, (data.dependencies || {}));

            self._traverse(json, deps, module, function (err) {
                if (err) {
                    debug('Error:', err);
                    return void(cb(err));
                }
                self._results.sort(function(lhs, rhs) {
                    return ((self._option.reverse)?-1:1)*(lhs.date - rhs.date);
                });
                cb(null, self._results);
            });
        });
    });
};

WhatHappened.prototype._traverse = function _traverse(json, deps, path, cb) {
    var self = this;
    var error;
    var tasks = [];

    Object.keys(deps).forEach(function (name) {
        if (error) {
            return; // skip
        }

        var ver = deps[name].version;
        var spec = json.dependencies[name];
        var module = name + '@' + ver;

        if (!ver) {
            error = new NotInstalledError(name + ' is not installed');
            return;
        }

        try {
            var nextJson = require(deps[name].realPath + '/package.json');
        } catch (e) {
            error = new NotInstalledError(e.message);
            return;
        }

        tasks.push(function (next) {
            var myPath = path + ':' + module;
            if (semver.validRange(spec)) {
                npm.commands.view([module, 'time'], true, function (err, pkg) {
                    if (err) {
                        return void(next(err));
                    }

                    var history = pkg[ver].time;
                    var results = [];

                    Object.keys(history).forEach(function (ver) {
                        if (!semver.valid(ver)) {
                            return;
                        }
                        if (!semver.satisfies(ver, spec)) {
                            return;
                        }
                        results.push({
                            'name': name,
                            'date': new Date(history[ver]).getTime(),
                            'ver': ver,
                            'path': myPath
                        });

                        /*
                        if (date >= self._since) {
                            self._results.push({
                                'date': date,
                                'ver': ver,
                                'path': myPath
                            });
                        }
                        */
                    });

                    // Sort by version
                    results.sort(function (lhs, rhs) {
                        return semver.gt(lhs.ver, rhs.ver);
                    });

                    // Add prev.
                    var prev = null;
                    results.forEach(function (item) {
                        item['prev'] = prev;
                        prev = item.ver;
                        if (item.date >= self._since) {
                            self._results.push(item);
                        }
                    });

                    if (deps[name].dependencies) {
                        self._traverse(
                            nextJson,
                            deps[name].dependencies,
                            myPath,
                            next);
                    } else {
                        next();
                    }
                });
            } else {
                if (deps[name].dependencies) {
                    self._traverse(
                        nextJson,
                        deps[name].dependencies,
                        myPath,
                        next);
                } else {
                    next();
                }
            }
        });
    });

    if (error) {
        return void(cb(error));
    }

    async.parallel(tasks, cb);
};

////////////////////////////////////////////////////////////////////////////////
// Error classes

function NotRootError(message) {
    this.name = 'NotRootError';
    this.message = message;
}
util.inherits(NotRootError, Error);

function NotInstalledError(message) {
    this.name = 'NotInstalledError';
    this.message = message;
}
util.inherits(NotInstalledError, Error);


////////////////////////////////////////////////////////////////////////////////
// Exports

module.exports = {
    create: function create(option) {
        return new WhatHappened(option);
    },
    NotRootError: NotRootError,
    NotInstalledError: NotInstalledError
};
