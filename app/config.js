require.config({

  deps: ['main'],

  paths: {
    vendor: 'components',

    underscore: 'components/lodash/lodash',
    jquery: 'components/jquery/jquery',
    moment: 'components/moment/moment',
    backbone: 'components/backbone-amd/backbone',
    pickadate: 'components/pickadate/source/pickadate',
    cookie: 'components/cookie/cookie',
    zeroclipboard: 'components/zeroclipboard/ZeroClipboard',

    tpl: 'components/requirejs-tpl/tpl',
    text: 'components/requirejs-text/text'

  },

  shim: {
    pickadate: {
      exports: 'jQuery.fn.pickadate',
      deps: ['jquery']
    },
    zeroclipboard: {
      exports: 'ZeroClipboard'
    }
  }
});
