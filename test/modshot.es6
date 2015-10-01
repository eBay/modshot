/*global describe, it*/
'use strict';

var exec = require('child_process').exec,
    assert = require('chai').assert,
    glob = require('glob');

describe('CLI validation', () => {
    it('should print USAGE text if --h option is used', done => {

        exec('node bin/modshot -h', (error, stdout) => {
            assert.isTrue(/USAGE/.test(stdout));
            assert.isTrue(/Options:/.test(stdout));
            done();
        });
    });

    it('should output error message for invalid directory', done => {

        exec('node bin/modshot -i junk', (error, stdout, stderr) => {
            assert.include(stderr, 'The below error occured when reading the input directory');
            done();
        });
    });

    it('should generate screenshots for HTML files in fixtures with no options', done => {

        exec('node bin/modshot', (error, stdout) => {
            assert.include(stdout, 'PASS', 'Output message should have the string PASS');
            glob('test/fixtures/**/*.png', function(er, files) {
                assert.isNull(er, 'Error should be null when retrieving screenshot png files');
                assert.isAbove(files.length, 0);
                done();
            });
        });
    });

    it('should generate screenshots for HTML files in fixtures with -i option as test', done => {

        exec('node bin/modshot -i test', (error, stdout) => {
            assert.include(stdout, 'PASS', 'Output message should have the string PASS');
            glob('test/fixtures/**/*.png', function(er, files) {
                assert.isNull(er, 'Error should be null when retrieving screenshot png files');
                assert.isAbove(files.length, 0);
                done();
            });
        });
    });
});
