'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        babel: {
            options: {
                optional: ['runtime']
            },
            all: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.js'],
                    dest: 'lib',
                    ext: '.js'
                }]
            }
        },

        watch: {
            files: ['src/**/*.js'],
            tasks: ['babel', 'livesnap']
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('livesnap', function() {
        var shelljs = require('shelljs');
        shelljs.exec('node lib/snapshot.js -i src/');
    });
};
