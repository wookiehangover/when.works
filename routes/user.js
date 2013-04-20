var _ = require('lodash');

/*
 * GET users listing.
 */

exports.me = function(req, res){
  var user = req.session.user;
  if(!user){
    return res.json({ error: 'Forbidden' }, 403);
  }

  var presentedUser = _.omit( user.data, 'id' );

  res.json(presentedUser);
};

/*
 * GET destroy current session
 */

exports.logout = function(req, res){
  req.session.destroy(function(err){
    if(err){
      console.log(err);
      return res.error(500);
    }
    res.redirect('/');
  });
};
