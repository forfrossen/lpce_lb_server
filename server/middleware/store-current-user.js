var loopback = require('loopback');

module.exports = function () {  
	return function ( req, res, next ) {
		return next();
		
		var tokenId = false;
		if (req.query && req.query.access_token) {
			tokenId = req.query.access_token;
		}
		// @TODO - not sure if this is correct since I'm currently not using headers
		// to pass the access token
		else if (req.headers && req.headers.access_token) {
			tokenId = req.headers.access_token
		}


		if ( tokenId ) {
			console.log('No access token in req: %O')
            return next();
		} else {
			console.log( 'Acces Token from req: %O', req.accessToken );
		}

        req.app.models.MyUser.findById(req.accessToken.userId, function (err, user) {

            if (err) {
                return next(err);
            }

            if (!user) {
                //user not found for accessToken, which is odd.
                return next();
            }

            req.app.models.Role.getRoles({
                principalType: req.app.models.RoleMapping.USER,
                principalId: user.id
            }, function (err, roles) {

                var reqContext = req.getCurrentContext();
                reqContext.set('currentUser', user);
                reqContext.set('ip', req.ip);
                reqContext.set('currentUserRoles', roles);
                next();
            });
        });
    };
};