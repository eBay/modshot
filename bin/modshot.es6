#!/usr/bin/env node

'use strict';

var nopt = require('nopt'),
    path = require('path'),
    _ = require('lodash');

// log messages to the console
function log(message) {
    console.log(message);
}

function exit(msg) {
    if (msg) {
        log(msg);
    }

    return process.exit(0);
}

function man() {
    const USAGE = `
    USAGE modshot [options]*

    Options:
    --in-dir | -i       The input directory to recurse and fetch the HTML files. Uses current directory if not specified
    --selectors | -s    A list of selectors to be applied on the HTML files
    --exclude | -e      Paths|files|directories to be excluded. node_modules excluded by default.
                        A list can be provided -e test -e dist
    --help | -h         Displays this information
    `;
    log(USAGE);
}

function parseOptions() {
    const DEFAULT_OPTIONS = {
        'in-dir': process.cwd(),
        'exclude': ['node_modules']
    };

    let knownOpts = {
            'in-dir': path,
            'selectors': Array,
            'exclude': Array,
            'help': Boolean
        },
        shortHands = {
            'i': ['--in-dir'],
            's': ['--selectors'],
            'e': ['--exclude'],
            'h': ['--help']
        },
        resolved = _.merge(DEFAULT_OPTIONS, nopt(knownOpts, shortHands), (a, b) => {
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

function exec() {
    var options = parseOptions();
    if (options) {
        // run modshot
        require('../src/modshot').run(options);
    }
}

// Start the executiom
exec();
