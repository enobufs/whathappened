var npm = require('npm');
var fs = require('fs');
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

            var module = data.name + '@' + data.version;
            var deps = self._option.dev?(data.devDependencies || {}):{};
            debug('keys=' + JSON.stringify(Object.keys(deps)));
            _und.extend(deps, (data.dependencies || {}));

            self._traverse(require(data.path + '/package.json'), deps, module, function (err) {
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
    var tasks = [];
    Object.keys(deps).forEach(function (name) {
        var ver = deps[name].version;
        var spec = json.dependencies[name];
        var module = name + '@' + ver;
        tasks.push(function (next) {
            var myPath = path + ':' + module;
            if (semver.validRange(spec)) {
                npm.commands.view([module, 'time'], true, function (err, pkg) {
                    if (err) {
                        return void(next(err));
                    }

                    var history = pkg[ver].time;
                    Object.keys(history).forEach(function (ver) {
                        if (!semver.valid(ver)) {
                            return;
                        }
                        if (semver.satisfies(ver, spec)) {
                            var date = new Date(history[ver]).getTime();
                            if (date >= self._since) {
                                self._results.push({
                                    'date': date,
                                    'ver': ver,
                                    'path': myPath
                                });
                            }
                        }
                    });

                    if (deps[name].dependencies) {
                        self._traverse(
                            require(deps[name].realPath + '/package.json'),
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
                        require(deps[name].realPath + '/package.json'),
                        deps[name].dependencies,
                        myPath,
                        next);
                } else {
                    next();
                }
            }
        });
    });

    async.parallel(tasks, cb);
};

module.exports = function(option, cb) {
    var wh = new WhatHappened(option);
    wh.start(cb);
};


module.exports({days: 14, dev: false}, function (err, results) {
    if (err) {
        process.exit(1);
    }
    results.forEach(function (item) {
        console.log(new Date(item.date) + ': ' + item.ver + ', ' + item.path);
    });
    process.exit(0);
});
