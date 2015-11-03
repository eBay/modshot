#!/usr/bin/env node

'use strict';

var nopt = require('nopt'),
    path = require('path'),
    url = require('url'),
    _ = require('lodash');

function exit(code) {
    return process.exit(code);
}

function man() {
    const USAGE = `
    USAGE modshot [options]*

    Options:
    --in-dir | -i       The input directory to recurse and fetch the HTML files.
                        Uses current working directory if not specified
    --url | -u          The web page URL to take screenshots
    --out-dir | -o      The output directory to save the screenshots.
                        Optional when an input directory is provided,
                        as screenshots are saved adjacent to the HTML files.
                        When a URL is provided and output directory is missing,
                        current working directory is used as output directory
    --selectors | -s    A list of selectors to be applied on the HTML files or URL
    --exclude | -e      Paths|files|directories to be excluded. node_modules excluded by default.
                        A list can be provided -e test -e dist
    --tolerance | -t    Mismatch tolerance percentage. Defaults to  0.05%
    --help | -h         Displays this information
    `;
    console.log(USAGE);
}

function parseOptions() {
    const DEFAULT_OPTIONS = {
            'exclude': ['node_modules']
        },
        knownOpts = {
            'in-dir': path,
            'out-dir': path,
            'url': url,
            'selectors': Array,
            'exclude': Array,
            'tolerance': Number,
            'help': Boolean
        },
        shortHands = {
            'i': ['--in-dir'],
            'o': ['--out-dir'],
            'u': ['--url'],
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

    // Verify if the URL is valid
    if (!resolved.url && resolved.argv.cooked.indexOf('--url') !== -1) {
        console.error('Please enter a valid URL with protocol');
        return exit(1);
    }

    // Set default value for input directory if both input dir & URL not provided
    if (!resolved['in-dir'] && !resolved.url) {
        resolved['in-dir'] = process.cwd();
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
