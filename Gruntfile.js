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
                    cwd: 'test',
                    src: ['**/*.es6'],
                    dest: 'test',
                    ext: '.js'
                }]
            }
        },

        watch: {
            files: ['!**/node_modules/**', '**/*.es6'],
            tasks: ['build', 'livesnap']
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('build', ['babel']);

    grunt.registerTask('livesnap', function() {
        var shelljs = require('shelljs');
        shelljs.exec('node src/snapshot -i test');
    });
};
