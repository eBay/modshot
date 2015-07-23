'use strict';

var path = require('path'),
    fs = require('fs'),
    EventEmitter = require('events').EventEmitter,
    childSpawn = require("child_process").spawn,
    _ = require('lodash'),
    casperjsExe = path.join(__dirname, '..', 'node_modules/casperjs/bin/casperjs');

// log messages to the console
function log(message) {
    console.log(message);
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
    if (!file || !excludeList || !excludeList.length) {
        return false;
    }
    // Toggle the response as this should return true if present in exclusion
    return !excludeList
        // Map each item in the excludeList to a RegExp pattern
        .map(exclude => {
            // Strip '/' before and after
            exclude = exclude.replace(/^\/|\/$/g, '');
            return new RegExp(`^${exclude}$|\/${exclude}$|^${exclude}\/|\/${exclude}\/`, 'i');
        })
        // Test the pattern with the file path and return immediately if passed
        .every(pattern => !pattern.test(file));
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
            }).catch(err => { // jshint ignore:line
                log('### The below error occured when reading the input directory ###');
                log(err);
            });
        };

    // call the wrapper
    readdirWrapper(inputDir);

    // return the Event Emitter
    return eventEmitter;
}

function runCasper(file) {
    let casperRunner = path.join(__dirname, 'casper-runner.js'),
        args = ['test', casperRunner, '--file=' + file, '--dirname=' + __dirname],
        casperjs = childSpawn(casperjsExe, args);

    // Log the data output
    casperjs.stdout.on('data', data => {
        log(data.toString());
    });

    // Log the error
    casperjs.stderr.on('data', data => {
        log(data.toString());
    });
}

// Run modshot with the provided options
function run(opts) {
    if (!opts['in-dir']) {
        log('Please provide an input directory');
        return;
    }
    getFileList(opts['in-dir'], opts.exclude).on('file', file => {
        // Run casper now
        runCasper(file);
    });
}

// Export the run method
module.exports = {
    run: run
};
