
/*
 * GET home page.
 */

exports.index = function(req, res){
  debugger;
  var user = req.session ? req.session.user : false;
  res.render('index', { user: user });
};

