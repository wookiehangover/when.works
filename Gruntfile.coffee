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
        wrap: false
        preserveLicenseComments: false
        almond: true

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
      camelcase: true
      curly: true
      eqeqeq: true
      strict: false
      immed: false
      forin: true
      latedef: false
      newcap: true
      noarg: true
      sub: true
      undef: true
      boss: true
      eqnull: true
      browser: true
      node: true
      expr: true
      globals:
        Modernizr: true
        define: true
        require: true

module.exports = (grunt) ->

  grunt.initConfig( config )

  grunt.loadNpmTasks('grunt-requirejs')
  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-cssmin')
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-devtools')

  grunt.registerTask('default', [
    'jshint'
    'requirejs'
    'less'
    'cssmin'
  ])
