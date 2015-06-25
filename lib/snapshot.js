'use strict';

var test = ['senthil', 'shobi', 'sanjith', 'shaan'];
test.map(function (name) {
    return name + ' S';
});
console.log(test);

var nopt = require('nopt'),
    path = require('path'),
    _ = require('lodash');

// Default options
var options = {
    'quiet': false,
    'in-dir': process.cwd()
};

// log messages to the console
function log(message) {
    // only log for non-quiet mode
    if (!options.quiet) {
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

function exit() {
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

// Start the main execution
function exec() {}

function run() {
    // set the options
    options = parseOptions();
    // execute snap
    exec();
}

if (isCLI()) {
    run();
}

console.log(parseOptions()['in-dir']);
