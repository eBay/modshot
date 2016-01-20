'use strict';

var path = require('path'),
    fs = require('fs'),
    url = require('url'),
    EventEmitter = require('events').EventEmitter,
    childSpawn = require("child_process").spawn,
    _ = require('lodash'),
    casperjsExePath = 'casperjs/bin/casperjs',
    phantomcssModuleName = 'phantomcss';

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

function isURLValid(urlStr) {
    const urlObj = url.parse(String(urlStr));
    return !!urlObj.host;
}

function isValidOutputDir(outDir) {
    try {
        const stat = fs.statSync(outDir);
        return stat.isDirectory();
    } catch (ex) {
        // Do nothing
    }

    return false;
}

function lookup(filePath, isExecutable) {
    let fullFilePath;
    module.paths.some(modulePath => {
        let absPath = path.join(modulePath, filePath);

        if (isExecutable && process.platform === 'win32') {
            absPath += '.cmd';
        }
        try {
            let stat = fs.statSync(absPath);
            if (isExecutable) {
                if (stat.isFile()) {
                    fullFilePath = absPath;
                    return true;
                }
            } else {
                fullFilePath = absPath;
                return true;
            }
        } catch (ex) {
            // Do nothing if path doesnt exist
        }
        return false;
    });
    return fullFilePath;
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
                console.error('The below error occured when reading the input directory');
                console.error(err);
            });
        };

    // call the wrapper
    readdirWrapper(inputDir);

    // return the Event Emitter
    return eventEmitter;
}

function runCasper(file, outDir, {selectors, tolerance, cookie, domain, prefix}) { // jshint ignore:line
    let casperRunner = path.join(__dirname, 'casper-runner.js'),
        args = ['test', casperRunner,
                `--file=${file}`,
                `--selectors=${selectors}`,
                `--tolerance=${tolerance}`,
                `--cookie=${cookie}`,
                `--domain=${domain}`,
                `--prefix=${prefix}`,
                `--outputDir=${outDir}`];

    try {
        let casperjsExe = lookup(casperjsExePath, true);
        // Check if casperjs executable is present
        if (!casperjsExe) {
            console.error('casperjs executable not found');
            return;
        }

        // Check if phantomCSS module is present executable is present
        let phantomcssPath = lookup(phantomcssModuleName);
        if (!phantomcssPath) {
            console.error('phantomcss not found');
            return;
        }

        // Add phantomcssPath to the args
        args.push('--phantomcssPath=' + phantomcssPath);

        let casperjs = childSpawn(casperjsExe, args); // Start casper JS with arguments
        // Log the data output
        casperjs.stdout.on('data', data => console.log(data.toString()));

        // Log the error
        casperjs.stderr.on('data', data => console.error(data.toString()));
    } catch (ex) {
        console.error('The below error occured when executing casperjs');
        console.error(ex);
    }
}

function processURL(urlStr, opts) {
    if (!isURLValid(urlStr)) {
        console.error('Please enter a valid URL with protocol');
        return;
    }

    // Validate output directory
    const outDir = opts['out-dir'] || process.cwd();
    if (!isValidOutputDir(outDir)) {
        console.error('Please provide a valid output directory');
        return;
    }

    runCasper(urlStr, outDir, opts);
}

function processInputDir(inDir, opts) {
    // Only use output directory if present and no URL input is provided
    const outDir = !opts.url && opts['out-dir'];
    if (outDir && !isValidOutputDir(outDir)) {
        console.error('Please provide a valid output directory');
        return;
    }

    getFileList(inDir, opts.exclude).on('file', file => {
        // Run casper now
        runCasper(file, outDir, opts);
    });
}

// Run modshot with the provided options
function run(opts) {
    if (!opts['in-dir'] && !opts.url) {
        console.error('Please provide an input directory or an URL');
        return 1;
    }

    // Process the URL
    if (opts.url) {
        processURL(opts.url, opts);
    }

    // Process the input directory
    if (opts['in-dir']) {
        processInputDir(opts['in-dir'], opts);
    }

    return 0;
}

// Export the run method
module.exports = {
    run: run
};
