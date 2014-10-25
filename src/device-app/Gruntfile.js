'use strict';
module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    test: {
      files: ['test/*.js']
    },
    lint: {
      files: ['grunt.js', 'lib/**/*.js', 'test/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
    },
    uglify: {
      all: {
        files: [{
          'app.min.js': [
            'app.js',
            'routes.js',
            'utils.js'
          ]
        }]
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['*.js', 'test/*.js']
    },
    simplemocha: {
      all: {
        src: 'test/*.js',
        options: {
          globals: ['should'],
          timeout: 3000,
          ignoreLeaks: false,
          ui: 'bdd',
          reporter: 'spec'
        }
      }
    },
    shell: {
      vsync: {
        options: {                      // Options
          stdout: true
        },
        command: function (host) {
          return 'fswatch . "vsync ' + host + '"';
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task.
  grunt.registerTask('default', ['jshint', 'simplemocha']);
  grunt.registerTask('test', ['simplemocha']);
};
