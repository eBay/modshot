#!/usr/bin/env node

'use strict';

var nopt = require('nopt'),
    path = require('path'),
    _ = require('lodash');

function exit(code) {
    return process.exit(code);
}

function man() {
    const USAGE = `
    USAGE modshot [options]*

    Options:
    --in-dir | -i       The input directory to recurse and fetch the HTML files. Uses current directory if not specified
    --selectors | -s    A list of selectors to be applied on the HTML files
    --exclude | -e      Paths|files|directories to be excluded. node_modules excluded by default.
                        A list can be provided -e test -e dist
    --tolerance | -t    Mismatch tolerance percentage. Defaults to  0.05%
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
            'tolerance': Number,
            'help': Boolean
        },
        shortHands = {
            'i': ['--in-dir'],
            's': ['--selectors'],
            'e': ['--exclude'],
            't': ['--tolerance'],
            'h': ['--help']
        },
        resolved = _.merge({}, DEFAULT_OPTIONS, nopt(knownOpts, shortHands), (a, b) => {
            if (Array.isArray(a)) {
                return a.concat(b);
            }
        });

    if (resolved.help) {
        man();
        return exit(0);
    }
    return resolved;
}

function exec() {
    let exitCode = 0;
    const options = parseOptions();
    if (options) {
        // run modshot
        exitCode = require('../src/modshot').run(options);
    }
    if (exitCode) {
        exit(exitCode);
    }
}

// Start the executiom
exec();
