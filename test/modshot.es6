/*global describe, it*/
'use strict';

var exec = require('child_process').exec,
    assert = require('chai').assert;

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
});
