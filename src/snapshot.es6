'use strict';

var nopt = require('nopt'),
    path = require('path'),
    fs = require('fs'),
    rimraf = require('rimraf'),
    EventEmitter = require('events').EventEmitter,
    childSpawn = require("child_process").spawn,
    _ = require('lodash'),
    casperjsExe = path.join(__dirname, '..', 'node_modules/casperjs/bin/casperjs');

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
    const USAGE = `
    USAGE snapshot [options]*

    Options:
    --in-dir | -i       The input directory to recurse and fetch the HTML files. Uses current directory if not specified
    --help | -h         Displays this information
    --quiet | -q        Keeps the console clear from logging.
    `;
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
    let knownOpts = {
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

// Promise wrapper for fs.stat
function stat(file) {
    return new Promise((resolve, reject) => {
        fs.stat(file, (err, stats) => {
            if (err) {
                return reject(err);
            }
            resolve(stats);
        });
    });
}

// Promise wrapper for fs.readdir
function readdir(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                return reject(err);
            }
            resolve(files);
        });
    });
}

// Promise wrapper for rimraf
function rmdir(dir) {
    return new Promise((resolve, reject) => {
        rimraf(dir, function(err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

function getFileList(inputDir) {
    let eventEmitter = new EventEmitter(),
        readdirWrapper = dir => {
            readdir(dir).then(list => {
                return Promise.all(list.map(item => path.join(dir, item)).map(item => {
                    return stat(item).then(stats =>  _.assign(stats, {
                        origFile: item
                    }));
                }));
            }).then(statsList => {
                statsList.forEach((stats) => {
                    let file = stats.origFile;
                    if (stats.isDirectory(file)) {
                        // Call the wrapper again
                        readdirWrapper(file);
                    } else if (stats.isFile(file) && path.extname(file) === '.html') {
                        eventEmitter.emit('file', file);
                    }
                });
            }).catch(exit); // jshint ignore:line
        };

    // call the wrapper
    readdirWrapper(inputDir);

    // return the Event Emitter
    return eventEmitter;
}

function runCasper(file) {
    let casperRunner = path.join(__dirname, 'casper-runner.js'),
        args = ['test', casperRunner, '--file=' + file],
        casperjs = childSpawn(casperjsExe, args);

    // Log the data output
    casperjs.stdout.on('data', data => {
        log(data.toString());
    });

    // Exit on error
    casperjs.stderr.on('data', data => {
        exit(data.toString());
    });
}

// Start the main execution
function exec() {
    getFileList(options['in-dir']).on('file', file => {
        // Remove failed dir if any
        rmdir(path.dirname(file) + '/failed').then(() => {
            // Run casper now
            runCasper(file);
        }).catch(exit); // jshint ignore:line
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
