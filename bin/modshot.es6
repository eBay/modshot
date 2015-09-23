#!/usr/bin/env node

'use strict';

var exitCode = 0,
    nopt = require('nopt'),
    path = require('path'),
    _ = require('lodash');

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
    console.log(USAGE);
}

function parseOptions() {
    const DEFAULT_OPTIONS = {
            'in-dir': process.cwd(),
            'exclude': ['node_modules']
        },
        knownOpts = {
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
        resolved = _.merge({}, DEFAULT_OPTIONS, nopt(knownOpts, shortHands), (a, b) => {
            if (Array.isArray(a)) {
                return a.concat(b);
            }
        });

    if (resolved.help) {
        man();
        return null;
    }
    return resolved;
}

function exec() {
    const options = parseOptions();
    if (options) {
        // run modshot
        exitCode = require('../src/modshot').run(options);
    }
}

process.on("exit", function() {
    process.exit(exitCode);
});

// Start the executiom
exec();
