'use strict';

var nopt = require('nopt'),
    path = require('path'),
    fs = require('fs'),
    EventEmitter = require('events').EventEmitter,
    childSpawn = require("child_process").spawn,
    _ = require('lodash'),
    casperjsExe = path.join(__dirname, '..', 'node_modules/casperjs/bin/casperjs');

// Default options
var options = {
    'in-dir': process.cwd(),
    'exclude': ['node_modules']
};

// log messages to the console
function log(message) {
    console.log(message);
}

function man() {
    const USAGE = `
    USAGE snapshot [options]*

    Options:
    --in-dir | -i       The input directory to recurse and fetch the HTML files. Uses current directory if not specified
    --exclude | -e      Paths|files|directories to be excluded. node_modules excluded by default.
                        A list can be provided -e test -e dist
    --help | -h         Displays this information
    `;
    log(USAGE);
}

// Check if the tool was called from command line
function isCLI() {
    return require.main === module;
}

function exit(msg) {
    if (msg) {
        log(msg);
    }
    if (isCLI()) {
        return process.exit(0);
    }
}

function parseOptions() {
    let knownOpts = {
            'in-dir': path,
            'exclude': Array,
            'help': Boolean
        },
        shortHands = {
            'i': ['--in-dir'],
            'e': ['--exclude'],
            'h': ['--help']
        },
        resolved = _.merge(options, nopt(knownOpts, shortHands), (a, b) => {
            if (Array.isArray(a)) {
                return a.concat(b);
            }
        });

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

function isExcluded(file, excludeList) {
    if (!file || !excludeList) {
        return false;
    }
    let parts = file.split('/');
    // Check if any of the file parts is in the exclusion list
    // Toggle the response as this should return true if present in exclusion
    return !parts.every(part => excludeList.indexOf(part) === -1);
}

function getFileList(inputDir, excludeList) {
    let eventEmitter = new EventEmitter(),
        readdirWrapper = dir => {
            readdir(dir).then(list => {
                return Promise.all(
                    // map the file list to a full valid apath
                    list.map(item => path.join(dir, item))
                    // Filter out the excludes
                    .filter(item => !isExcluded(item, excludeList))
                    // Map each file item to a stat promise
                    .map(item => {
                        // Return a promise
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
    getFileList(options['in-dir'], options.exclude).on('file', file => {
        // Run casper now
        runCasper(file);
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
