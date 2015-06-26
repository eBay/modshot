'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var nopt = require('nopt'),
    path = require('path'),
    fs = require('fs'),
    EventEmitter = require('events').EventEmitter,
    _ = require('lodash');

// Default options
var options = {
    'quiet': false,
    'in-dir': process.cwd()
};

// log messages to the console
function log(message, override) {
    // only log for non-quiet mode
    if (!options.quiet || override) {
        console.log(message);
    }
}

function man() {
    var USAGE = '\n    USAGE snapshot [options]*\n\n    Options:\n    --in-dir | -i       The input directory to recurse and fetch the HTML files. Uses current directory if not specified\n    --help | -h         Displays this information\n    --quiet | -q        Keeps the console clear from logging.\n    ';
    log(USAGE);
}

// Check if the tool was called from command line
function isCLI() {
    return require.main === module;
}

function exit(msg) {
    if (msg) {
        log(msg, true);
    }
    if (isCLI()) {
        return process.exit(0);
    }
}

function parseOptions() {
    var knownOpts = {
        'in-dir': path,
        'quiet': Boolean,
        'help': Boolean
    },
        shortHands = {
        'i': ['--in-dir'],
        'q': ['--quiet'],
        'h': ['--help']
    },
        resolved = _.assign(options, nopt(knownOpts, shortHands));

    if (resolved.help) {
        man();
        return exit();
    }
    return resolved;
}

function stat(file) {
    return new _Promise(function (resolve, reject) {
        fs.stat(file, function (err, stats) {
            if (err) {
                return reject(err);
            }
            resolve(stats);
        });
    });
}

function readdir(dir) {
    return new _Promise(function (resolve, reject) {
        fs.readdir(dir, function (err, files) {
            if (err) {
                return reject(err);
            }
            resolve(files);
        });
    });
}

function getFileList(inputDir) {
    var eventEmitter = new EventEmitter(),
        readdirWrapper = function readdirWrapper(dir) {
        readdir(dir).then(function (list) {
            return _Promise.all(list.map(function (item) {
                return path.join(dir, item);
            }).map(function (item) {
                return stat(item).then(function (stats) {
                    return _.assign(stats, {
                        origFile: item
                    });
                });
            }));
        }).then(function (statsList) {
            statsList.forEach(function (stats) {
                var file = stats.origFile;
                if (stats.isDirectory(file)) {
                    // Call the wrapper again
                    readdirWrapper(file);
                } else if (stats.isFile(file) && path.extname(file) === '.html') {
                    eventEmitter.emit('file', file);
                }
            });
        })['catch'](function (err) {
            return exit(err);
        });
    };

    // call the wrapper
    readdirWrapper(inputDir);

    // return the Event Emitter
    return eventEmitter;
}

// Start the main execution
function exec() {
    getFileList(options['in-dir']).on('file', function (file) {
        return console.log(file);
    });
}

function run() {
    // set the options
    options = parseOptions();
    // execute snap
    exec();
}

if (isCLI()) {
    run();
}
