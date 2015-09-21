/*global describe, it*/
'use strict';

var exec = require('child_process').exec,
    assert = require('chai').assert;

describe('CLI validation', () => {
    it('should print USAGE text if -- option is used', done => {

        exec('node bin/modshot --h', (error, stdout) => {
            if (error) {
                throw error;
            }
            assert(/USAGE/.test(stdout), 'Outputs USAGE text');
            done();
        });
    });
});
