// Re-route Require.js to compiled JS when in production
module.exports = function(req, res, next){
  if( process.env.NODE_ENV === "production" &&
      req.url === '/app/components/requirejs/require.js'){
    req.url = '/js/untaken.js';
  }
  next();
};
