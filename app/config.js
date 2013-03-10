require.config({

  deps: ['main'],

  paths: {
    vendor: 'components',

    lodash: 'components/lodash/lodash',
    jquery: 'components/jquery/jquery',
    moment: 'components/moment/moment',
    backbone: 'components/backbone/backbone',

    tpl: 'components/requirejs-tpl/tpl',
    text: 'components/requirejs-text/text'

  },

  shim: {
    backbone: {
      exports: 'Backbone',
      deps: ['lodash', 'jquery']
    }
  }
});
