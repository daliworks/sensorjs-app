'use strict';

module.exports = function (grunt) {
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  grunt.initConfig({
    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist'
    },
    watch: {
      less: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.less'],
        tasks: ['recess']
      },
      livereload: {
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        options: {
          livereload: true
        }
      }
    },
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      },
      server: {
        options: {
          base: '<%= yeoman.app %>'
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/**/*.js'
      ]
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    less: {
      server: {
        files: {
          '.tmp/styles/bootstrap.css': '<%= yeoman.app %>/styles/less_twitter_bootstrap/bootstrap.less',
          '.tmp/styles/app.css': '<%= yeoman.app %>/styles/*.less',
          '<%= yeoman.app %>/styles/bootstrap.css': '<%= yeoman.app %>/styles/less_twitter_bootstrap/bootstrap.less',
          '<%= yeoman.app %>/styles/app.css': '<%= yeoman.app %>/styles/*.less'
        }
      },
      dist: {
        files: {
          '.tmp/styles/bootstrap.css': '<%= yeoman.app %>/styles/less_twitter_bootstrap/bootstrap.less',
          '.tmp/styles/app.css': '<%= yeoman.app %>/styles/*.less'
        }
      }
    },
    requirejs: {
      compile: {
        options: {
          name: 'main',
          optimize: 'none', // requirejs has own copy of uglifyjs that breaks the build
          baseUrl: '<%= yeoman.app %>/scripts/',
          mainConfigFile: '<%= yeoman.app %>/scripts/main.js',
          out: '<%= yeoman.dist %>/scripts/main.js'
        }
      }
    },
    concat: {
      dist: {
        files: {
          // '<%= yeoman.dist %>/scripts/scripts.js': [
          //   '.tmp/scripts/{,*/}*.js',
          //   '<%= yeoman.app %>/scripts/{,*/}*.js'
          // ]
        }
      }
    },
    useminPrepare: {
      html: ['<%= yeoman.app %>/index.html', '<%= yeoman.app %>/views/**/*.html'],
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html', '<%= yeoman.dist %>/views/**/*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    cssmin: {
      dist: {
        files: [
          // {
          //   '<%= yeoman.dist %>/styles/main.css': [
          //     '.tmp/styles/{,*/}*.css',
          //     '<%= yeoman.app %>/styles/{,*/}*.css'
          //   ]
          // },
          {
            expand: true,
            cwd: '<%= yeoman.dist %>/styles/',
            src: ['*.css', '!*.min.css'],
            dest: '<%= yeoman.dist %>/styles/'
          }
        ]
      }
    },
    htmlmin: {
      dist: {
        options: {
          /*removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['*.html', 'views/**/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>/scripts',
          src: '*.js',
          dest: '<%= yeoman.dist %>/scripts'
        }]
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/main.js': [
            '<%= yeoman.dist %>/scripts/main.js'
          ]
        }
      }
    },
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            // '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,txt}',
            '.htaccess',
            // 'components/**/*',
            'images/{,*/}*.{gif,webp}',
            'fonts/*',
            'styles/fonts/*',
            'vendor/requirejs/require.js'
          ]
        }]
      }
    }
  });

  grunt.renameTask('regarde', 'watch');

  grunt.registerTask('server', [
    'clean:server',
    'less:server',
    'connect',
    'open',
    'watch'
  ]);

  grunt.registerTask('test', [
    'clean:server',
    'less:server',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'jshint',
    'less:dist',
    'useminPrepare',
    'requirejs',
    'concat',
    'imagemin',
    'cssmin',
    'htmlmin',
    'copy',
//    'cdnify',
    'ngmin',
    'uglify',
    'rev:dist',
    'usemin'
  ]);

  grunt.registerTask('default', ['build']);
};
