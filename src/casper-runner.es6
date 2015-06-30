'use strict';

/* globals patchRequire,casper */

var require = patchRequire(require), // jshint ignore:line
    fs = require('fs'),
    path = require('path'),
    phantomcssPath = fs.absolute(fs.workingDirectory) + '/node_modules/phantomcss',
    phantomcss = require(phantomcssPath + '/phantomcss'),
    _ = require('lodash');

// Default options
var options = {
    'quiet': false,
    'file': null
};

function parseOptions() {
    return _.assign(options, casper.cli.options);
}

function initOptions() {
    options = parseOptions();
}

// log messages to the console
function log(message, override) {
    // only log for non-quiet mode
    if (!options.quiet || override) {
        console.log(message);
    }
}

function exit(msg) {
    if (msg) {
        log(msg, true);
    }
    return casper.exit(0);
}

function initPhantomCSS(dirPath) {
    let screenshotRoot = dirPath + '/screenshots',
        failedComparisonsRoot = screenshotRoot + '/failed';

    // Remove failed directory if any
    fs.removeTree(failedComparisonsRoot);

    // Initialize phantomCSS
    phantomcss.init({
        casper: casper,
        cleanupComparisonImages: true,
        libraryRoot: phantomcssPath,
        screenshotRoot: screenshotRoot,
        failedComparisonsRoot: failedComparisonsRoot,
        addLabelToFailedImage: false,
        mismatchTolerance: 0.00001
    });
}

function takeScreenshot(screenshotName) {
    phantomcss.screenshot('*', screenshotName);
}

function compareScreenshot() {
    phantomcss.compareSession();
}

function run() {
    // Init options first
    initOptions();

    let file = options.file;
    if (!file) {
        exit('Please provide a html file path to continue');
        return;
    }

    // Initialize PhantomCSS
    initPhantomCSS(path.dirname(file));

    casper.test.begin('Visual testing - ' + options.file, test => {
        casper.start(file);

        // Set the viewport
        casper.viewport(1024, 768);

        // Take screenshot
        casper.then(takeScreenshot.bind(undefined, path.basename(file, '.html')));

        // Compare screenshot
        casper.then(compareScreenshot);

        // Run & wrap up the test
        casper.run(() => {
            log('Finished visual testing for - ' + file);
            test.done();
            // Calling exit to prevent unsafe JavaScript error https://github.com/n1k0/casperjs/issues/1068
            casper.exit();
        });
    });
}

// Start the run
run();
