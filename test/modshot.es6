/*global describe, it*/
'use strict';

var exec = require('child_process').exec,
    assert = require('chai').assert,
    glob = require('glob'),
    tolerance = process.env.MISMATCH_TOLERANC, // jshint ignore:line
    toleranceOption = ` -t ${tolerance || ''} `;

describe('CLI validation', () => {

    it('should print USAGE text if --h option is used', done => {

        exec('node bin/modshot -h', (error, stdout) => {
            assert.isTrue(/USAGE/.test(stdout));
            assert.isTrue(/Options:/.test(stdout));
            done();
        });
    });

    describe('Static HTML file input validation', () => {

        it('should output error message for invalid directory', done => {

            exec('node bin/modshot -i junk', (error, stdout, stderr) => {
                assert.include(stderr, 'The below error occured when reading the input directory');
                done();
            });
        });

        it('should output error message for invalid output directory', done => {

            exec('node bin/modshot -o junk', (error, stdout, stderr) => {
                assert.include(stderr, 'Please provide a valid output directory');
                done();
            });
        });

        it('should exit with no-op when no HTML files are found in the input directory', done => {

            exec('node bin/modshot -i src', (error, stdout, stderr) => {
                assert.include(stderr, '');
                assert.include(stdout, '');
                done();
            });
        });

        it('should exit with no-op when node_modules is provided as an input directory', done => {

            exec('node bin/modshot -i node_modules', (error, stdout, stderr) => {
                assert.include(stderr, '');
                assert.include(stdout, '');
                done();
            });
        });

        it('should not process directories that are included in the exclude -e option', done => {

            exec('node bin/modshot -i test -e test', (error, stdout, stderr) => {
                assert.include(stderr, '');
                assert.include(stdout, '');
                done();
            });
        });

        it('should generate screenshots for HTML files in fixtures with no options', done => {

            exec('node bin/modshot' + toleranceOption, (error, stdout) => {
                assert.include(stdout, 'PASS', 'Output message should have the string PASS');
                glob('test/fixtures/**/*.png', function(er, files) {
                    assert.isNull(er, 'Error should be null when retrieving screenshot png files');
                    assert.isAbove(files.length, 0);
                    done();
                });
            });
        });

        it('should generate screenshots for HTML files in fixtures with -i option as test', done => {

            exec('node bin/modshot -i test' + toleranceOption, (error, stdout) => {
                assert.include(stdout, 'PASS', 'Output message should have the string PASS');
                glob('test/fixtures/**/*.png', function(er, files) {
                    assert.isNull(er, 'Error should be null when retrieving screenshot png files');
                    assert.isAbove(files.length, 0);
                    done();
                });
            });
        });

        it('should generate screenshots for HTML files only for selector region provided with -s option', done => {

            exec('node bin/modshot -i test -s .box' + toleranceOption, (error, stdout) => {
                assert.include(stdout, 'PASS', 'Output message should have the string PASS');
                glob('test/fixtures/box/**/*.png', function(er, files) {
                    assert.isNull(er, 'Error should be null when retrieving screenshot png files');
                    assert.isTrue(files.length >= 6);
                    done();
                });
            });
        });

        it('should generate screenshots for HTML files only for selector regions with multiple -s option', done => {

            exec('node bin/modshot -i test -s .box -s test1' + toleranceOption, (error, stdout) => {
                assert.include(stdout, 'PASS', 'Output message should have the string PASS');
                glob('test/fixtures/**/*.png', function(er, files) {
                    assert.isNull(er, 'Error should be null when retrieving screenshot png files');
                    assert.isTrue(files.length >= 10);
                    done();
                });
            });
        });

        it('should generate screenshots in the provided output directory for HTML files in fixtures', done => {

            exec('node bin/modshot -i test -o test' + toleranceOption, (error, stdout) => {
                assert.include(stdout, 'PASS', 'Output message should have the string PASS');
                glob('test/screenshots/*.png', function(er, files) {
                    assert.isNull(er, 'Error should be null when retrieving screenshot png files from output dir');
                    assert.equal(files.length, 4);
                    done();
                });
            });
        });

        it('should generate screenshots prepended with the provided prefix for HTML files in fixtures', done => {

            exec('node bin/modshot -i test -o test/prefix/static -p modshot' + toleranceOption, (error, stdout) => {
                assert.include(stdout, 'PASS', 'Output message should have the string PASS');
                glob('test/prefix/static/screenshots/modshot-*.png', function(er, files) {
                    assert.isNull(er, 'Error should be null when retrieving screenshot png files from output dir');
                    assert.equal(files.length, 4);
                    done();
                });
            });
        });
    });

    describe('URL input validation', () => {
        it('should output error message for invalid URL', done => {

            exec('node bin/modshot -u junk', (error, stdout, stderr) => {
                assert.include(stderr, 'Please enter a valid URL');
                done();
            });
        });

        it('should output error message for invalid output directory', done => {

            exec('node bin/modshot -i http://www.ebay.com -o junk', (error, stdout, stderr) => {
                assert.include(stderr, 'Please provide a valid output directory');
                done();
            });
        });

        it('should generate a full page screenshot for a URL in the test/url/full directory', done => {

            exec('node bin/modshot -u http://pages.ebay.com/sitemap.html -o test/url/full/' +
            toleranceOption, (error, stdout) => {
                assert.include(stdout, 'PASS', 'Output message should have the string PASS');
                glob('test/url/full/screenshots/*.png', function(er, files) {
                    assert.isNull(er, 'Error should be null when retrieving screenshot png files from output dir');
                    assert.equal(files.length, 2);
                    done();
                });
            });
        });

        it('should generate screenshot for a URL in the test/url/full directory with cookie & domain options', done => {

            exec('node bin/modshot -u http://pages.ebay.com/sitemap.html -o test/url/full/ -c "k=v; a=b" -d xyz.com' +
            toleranceOption, (error, stdout) => {
                assert.include(stdout, 'PASS', 'Output message should have the string PASS');
                glob('test/url/full/screenshots/*.png', function(er, files) {
                    assert.isNull(er, 'Error should be null when retrieving screenshot png files from output dir');
                    assert.equal(files.length, 2);
                    done();
                });
            });
        });

        it('should generate screenshots for a URL in test/url/selectors directory for the provided selectors', done => {

            exec('node bin/modshot -u http://pages.ebay.com/sitemap.html -o test/url/selectors/ -s h1 -s h2' +
            toleranceOption, (error, stdout) => {
                assert.include(stdout, 'PASS', 'Output message should have the string PASS');
                glob('test/url/selectors/screenshots/*.png', function(er, files) {
                    assert.isNull(er, 'Error should be null when retrieving screenshot png files from output dir');
                    assert.isAbove(files.length, 0);
                    done();
                });
            });
        });

        it('should generate screenshots prepended with the provided prefix for a URL', done => {

            exec('node bin/modshot -u http://pages.ebay.com/sitemap.html -o test/prefix/url -p modshot' +
            toleranceOption, (error, stdout) => {
                assert.include(stdout, 'PASS', 'Output message should have the string PASS');
                glob('test/prefix/url/screenshots/modshot-*.png', function(er, files) {
                    assert.isNull(er, 'Error should be null when retrieving screenshot png files from output dir');
                    assert.equal(files.length, 2);
                    done();
                });
            });
        });

        it('should generate screenshots when both a URL and input directory are provided', done => {

            exec('node bin/modshot -u http://pages.ebay.com/sitemap.html -o test/url/full/ -i test/' +
            toleranceOption, (error, stdout) => {
                assert.include(stdout, 'PASS', 'Output message should have the string PASS');
                glob('test/url/full/screenshots/*.png', function(er, files) {
                    assert.isNull(er, 'Error should be null when retrieving screenshot png files from output dir');
                    assert.equal(files.length, 2);
                    glob('test/fixtures/**/*.png', function(er, files) {
                        assert.isNull(er, 'Error should be null when retrieving screenshot png files');
                        assert.isAbove(files.length, 0);
                        done();
                    });
                });
            });
        });
    });
});
