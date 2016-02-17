/* eslint "no-use-before-define": 0 */
'use strict';

/* globals patchRequire,casper,phantom */

// override the phantom.casperScriptBaseDir temporarily
const origCasperScriptBaseDir = phantom.casperScriptBaseDir;
phantom.casperScriptBaseDir = `${origCasperScriptBaseDir}/..`;

const require = patchRequire(require), // jshint ignore:line
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    options = _.merge({ // Merge default options and cli options
        'file': null,
        'selectors': null,
        'tolerance': null,
        'phantomcssPath': null,
        'outputDir': null,
        'cookie': null,
        'domain': null,
        'prefix': null
    }, casper.cli.options, (a, b) => {
        if (b === 'undefined') {
            return null;
        }
        return undefined;
    }),
    phantomcssPath = options.phantomcssPath,
    phantomcss = phantomcssPath ? require(path.join(phantomcssPath, 'phantomcss')) : null,
    screenshotDir = '/screenshots',
    failedDir = `${screenshotDir}/failed`,
    resultsDir = `${screenshotDir}/results`,
    profiles = [
        /*eslint-disable */
        {
            "type": "mobile",
            "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4", // jshint ignore:line
            "width": 375,
            "height": 627
        },
        {
            "type": "desktop",
            "userAgent": casper.options.pageSettings.userAgent,
            "width": 1024,
            "height": 768
        }
        /*eslint-disable */
    ];

// Reset phantom.casperScriptBaseDir
phantom.casperScriptBaseDir = origCasperScriptBaseDir;

function exit(msg, code = 0) {
    if (msg) {
        if (code === 0) {
            console.log(msg);
        } else {
            console.error(msg);
        }
    }
    return casper.exit(code);
}

function getScreenshotName(file, profileType, prefix) {
    let screenshotName = url.parse(String(file)).hostname;
    if (!screenshotName) {
        screenshotName = path.basename(file, '.html');
    }
    // Add type if present
    if (profileType) {
        screenshotName += `-${profileType}`;
    }

    // Prefix the name if present
    if (prefix) {
        screenshotName = `${prefix}-${screenshotName}`;
    }

    return screenshotName;
}

function initPhantomCSS(dirPath) {
    const screenshotRoot = dirPath + screenshotDir,
        failedComparisonsRoot = dirPath + failedDir;

    // Remove failed directory if any
    fs.removeTree(failedComparisonsRoot);

    // Initialize phantomCSS
    phantomcss.init({
        casper: casper,
        cleanupComparisonImages: true,
        comparisonResultRoot: dirPath + resultsDir,
        libraryRoot: phantomcssPath,
        screenshotRoot: screenshotRoot,
        failedComparisonsRoot: failedComparisonsRoot,
        addLabelToFailedImage: false,
        mismatchTolerance: _.isNumber(options.tolerance) && options.tolerance
    });
}

function takeFullScreenshot(screenshotName) {
    phantomcss.screenshot('*', screenshotName);
}

function getClassNamesToCapture(selectors) {
    // convert the selectors to an array
    const selectorsArr = selectors.split(','),
        classNames = [];

    selectorsArr.forEach((selector, selectorIndex) => {
        const domNodes = Array.prototype.map.call(document.querySelectorAll(selector), node => node);
        // populate the class names
        domNodes.forEach((element, elementIndex) => {
            const className = `modshot-${selectorIndex}-${elementIndex}`;
            element.setAttribute('class', `${element.getAttribute('class')} ${className}`);
            classNames.push(className);
        });
    });

    return classNames;
}

function takeSelectorScreenshot(screenshotName, classNames) {
    // Take screenshot for all the class names
    classNames.forEach((className, index) => {
        phantomcss.screenshot(`.${className}`, `${screenshotName}-${index}`);
    });
}

function compareScreenshot() {
    phantomcss.compareSession();
}

function setCookie(cookie, domain) {
    if (!cookie) {
        return;
    }

    cookie.split(';')
        .map(cookielet => {
            const pair = cookielet.trim().split('=');
            return {
                name: pair[0],
                value: pair[1]
            };
        }).forEach(({ name, value }) => {
            phantom.addCookie({
                "name": name,
                "value": value,
                "domain": domain
            });
        });
}

function run() {
    // Check if phantomcss is present
    if (!phantomcss) {
        exit('PhantomCSS not found', 1);
        return;
    }

    const file = options.file;
    if (!file) {
        exit('Please provide a html file path to continue', 1);
        return;
    }
    const dirPath = options.outputDir || path.dirname(file);

    // Initialize PhantomCSS
    initPhantomCSS(dirPath);

    // Set cookie
    if (options.cookie) {
        setCookie(options.cookie, options.domain);
    }

    // Run casper for every profile
    profiles.forEach((profile, index) => {
        casper.test.begin(`${profile.type.toUpperCase()} visual testing - ${file}`, test => {
            // Set the user-agent
            casper.options.pageSettings.userAgent = profile.userAgent;

            casper.start(file);

            // Set the viewport
            casper.viewport(profile.width, profile.height);

            // Take screenshot
            const screenshotName = getScreenshotName(file, profile.type, options.prefix);
            if (options.selectors) {
                casper.then(() => {
                    const classNames = casper.evaluate(getClassNamesToCapture, options.selectors);
                    takeSelectorScreenshot(screenshotName, classNames);
                });
            } else {
                casper.then(takeFullScreenshot.bind(undefined, screenshotName));
            }

            // Compare screenshot
            casper.then(compareScreenshot);

            // Run & wrap up the test
            casper.run(() => {
                // Clean up the results dir
                fs.removeTree(dirPath + resultsDir);

                casper.echo(`Finished visual testing for - ${file}`, 'COMMENT');
                casper.echo(`Screenshots generated in the directory - ${dirPath}/screenshots`, 'COMMENT');
                test.done();
                // Calling exit to prevent unsafe JavaScript error https://github.com/n1k0/casperjs/issues/1068
                // Call after all profiles are iterated
                if (index === profiles.length - 1) {
                    casper.exit();
                }
            });
        });
    });
}

// Start the run
run();
