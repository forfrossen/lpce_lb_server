var loopback = require('loopback');
/*
module.exports = function () {  
    return function (req, res, next) {
		if ( !req.accessToken ) {
			console.log('No access token in req')
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
};*/