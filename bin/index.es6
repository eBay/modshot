#!/usr/bin/env node

'use strict';

var nopt = require('nopt'),
    path = require('path'),
    _ = require('lodash');

function exit(msg) {
    if (msg) {
        log(msg);
    }

    return process.exit(0);
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

function parseOptions() {
    const DEFAULT_OPTIONS = {
        'in-dir': process.cwd(),
        'exclude': ['node_modules']
    };

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
        // run snap
        require('src/snapshot').run(parseOptions());
    }
}

// Start the executiom
exec();
