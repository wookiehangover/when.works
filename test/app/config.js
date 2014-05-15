require.config({

  deps: ['test/main'],

  baseUrl: '../app',

  paths: {
    underscore: 'components/lodash/lodash',
    jquery: 'components/jquery/jquery',
    moment: 'components/moment/moment',
    backbone: 'components/backbone/backbone',
    pickadate: 'components/pickadate/source/pickadate',
    cookie: 'components/cookie/cookie',
    chai: '../node_modules/chai/chai',
    squire: 'components/Squire.js/src/Squire',

    tpl: 'components/requirejs-tpl/tpl',
    text: 'components/requirejs-text/text',

    test: '../test/app'
  },

  shim: {
    pickadate: {
      exports: 'jQuery.fn.pickadate',
      deps: ['jquery']
    }
  }
});

