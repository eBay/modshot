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
                    src: ['**/*.es6'],
                    dest: 'src',
                    ext: '.js'
                },
                {
                    expand: true,
                    cwd: 'bin',
                    src: ['**/*.es6'],
                    dest: 'bin',
                    ext: '.js'
                },
                {
                    expand: true,
                    cwd: 'test',
                    src: ['**/*.es6'],
                    dest: 'test',
                    ext: '.js'
                }]
            }
        },

        watch: {
            files: ['!**/node_modules/**', '**/*.es6'],
            tasks: ['build']
        },

        mochaTest: {
            src: ['test/**/*.js'],
            options: {
                timeout: 15000
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('build', ['babel']);

    grunt.registerTask('test', ['build', 'mochaTest']);
};
