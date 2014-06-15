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

  jshint:
    files: [
      'app/*.js'
      'app/collections/*.js'
      'app/models/*.js'
      'app/views/*.js'
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

  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-cssmin')
  grunt.loadNpmTasks('grunt-mocha-phantomjs')
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.registerTask('default', [
    'jshint'
    'less'
    'cssmin'
  ])
