/*global describe, it*/
'use strict';

var exec = require('child_process').exec,
    assert = require('chai').assert;

describe('CLI validation', () => {
    it('should print USAGE text if --h option is used', () => {

        exec('node bin/modshot --h', (error, stdout) => {
            if (error) {
                throw error;
            }
            assert.isTrue(/USAGE/.test(stdout));
            assert.isTrue(/Options:/.test(stdout));
        });
    });
});
