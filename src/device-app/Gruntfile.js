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
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true,
        indent: 2,
        onecase: true
      },
      globals: {
        exports: true
      }
    },
    simplemocha: {
      all: {
        src: 'test/*.js',
        options: {
          globals: ['should'],
          timeout: 3000,
          ignoreLeaks: false,
          ui: 'bdd',
          reporter: 'dot'
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
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task.
  grunt.registerTask('default', 'simplemocha lint');
};
