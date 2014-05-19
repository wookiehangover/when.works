require.config({

  deps: ['main'],

  paths: {
    vendor: 'components',

    underscore: 'components/lodash/lodash',
    jquery: 'components/jquery/jquery',
    moment: 'components/moment/moment',
    backbone: 'components/backbone/backbone',
    pickadate: 'components/pickadate/source/pickadate',
    cookie: 'lib/cookie',

    tpl: 'components/requirejs-tpl/tpl',
    text: 'components/requirejs-text/text',
    jsx: 'components/require-jsx/jsx',
    JSXTransformer: 'components/react/JSXTransformer',
    react: 'components/react/react'
  },

  shim: {
    pickadate: {
      exports: 'jQuery.fn.pickadate',
      deps: ['jquery']
    },
    JSXTransformer: {
      exports: 'JSXTransformer'
    }
  }
});
