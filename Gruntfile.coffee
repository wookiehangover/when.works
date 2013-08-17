config =
  less:
    compile:
      options:
        paths: ['public/less']
      files:
        'public/css/untaken.css': 'public/less/untaken.less'

  cssmin:
    compress:
      files:
        'public/css/untaken.css': ['public/css/untaken.css']
      options:
        keepSpecialComments: 0

  requirejs:
    compile:
      options:
        mainConfigFile: 'app/config.js'
        name: 'config'
        out: 'public/js/untaken.js'
        optimize: 'uglify2'
        wrap: true
        preserveLicenseComments: false
        almond: true
        generateSourceMaps: true

  jshint:
    files: [
      'app/*.js'
      'app/views/*.js'
      'app/models/*.js'
      'app/collections/*.js'
      'server.js'
      'routes/**/*.js'
      'lib/**/*.js'
    ]
    options:
      jshintrc: ".jshintrc"

  mocha_phantomjs:
    options:
      reporter: 'dot'
    all: ['test/index.html']

  watch:
    test:
      files: ['test/**/*.js']
      tasks: ['mocha_phantomjs']
    less:
      files: ['public/less/**/*.less']
      tasks: ['less']

module.exports = (grunt) ->

  grunt.initConfig( config )

  grunt.loadNpmTasks('grunt-requirejs')
  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-cssmin')
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-mocha-phantomjs')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.registerTask('default', [
    'jshint'
    'requirejs'
    'less'
    'cssmin'
  ])
