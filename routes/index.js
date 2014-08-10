
/*
 * GET home page.
 */

exports.index = function(req, res){
  if (req.session && req.session.user) {
    res.render('index', { user: req.session.user });
  } else {
    res.render('landing-page', { user: false })
  }
}
