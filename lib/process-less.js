/*
 * Less Middleware
 *
 * Captures requests for your production css and serves a compiled less bundle
 * in its place. Less parser is pretty quick, no noticeable load times when
 * parsing bootstrap & custom less on every request. Errors are printed to the
 * console.
 *
 * Meant to be mounted to your css directory, eg:
 *
 *  app.use('/css', require('process-less')({ path: './public/less' });
 *
 * Assuming that
 *
 *  1. The production css is served by other static middleware from './public/css'
 *  2. The Less source files are located at './public/less', set by the `path`
 *     configuration option
 *
 *  Development mode only--you should pre-compile with Grunt for production.
 */

var fs = require('fs');
var path = require('path');
var less = require('less');

module.exports = function(config){

  if( !config ){
    throw new Error('You must pass a config object to process-less');
  }

  var parser = new less.Parser({
    paths: [ config.src ]
  });

  return function processLess( req, res, next ){

    if( process.env.NODE_ENV === 'production' ){
      return next();
    }

    var filename = req.url.match(/\/?(\S+).css$/);
    if( filename.length === 2 ){
      filename = filename[1];
    } else {
      return next();
    }

    var lessPath = path.resolve( config.src +'/'+ filename +'.less');

    fs.readFile(lessPath, 'utf-8', function( err, data ){
      if( err ) {
        console.log(err);
        res.writeHead(404);
        res.end();
      }

      parser.parse( data, function(err, css ){
        res.writeHead(200, {'Content-Type': 'text/css'});
        var errorMsg;
        if( err ){
          errorMsg = '/*\n';
          for(var i in err) {
            if( err.hasOwnProperty(i) ){
              errorMsg += ( i +': '+ err[i] + '\n' );
            }
          }
          errorMsg += '*/\n';
          console.log('\n====\n'+ errorMsg +'\n====\n');
        }
        res.end( errorMsg || css.toCSS() );
      });
    });
  };

};
