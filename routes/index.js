
/*
 * GET home page.
 */

exports.index = function(req, res){
  if( req.headers && String(req.headers.host).indexOf('untaken.herokuapp.com') > - 1 ){
    return res.redirect('http://unavailable.at');
  }
  var user = req.session ? req.session.user : false;
  res.render('index', { user: user });
}
