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
