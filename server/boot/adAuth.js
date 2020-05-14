var loopbackPassport = require('loopback-component-passport');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var debug = require('debug')('loopback:security:adAuth');

module.exports = function ( app ) {
	
	var UserModel = app.models.User;
	var passportConfigurator = new PassportConfigurator(app);

	var ttl = 60 * 60;

	debug('ADAuth loaded!');


	var deleteExpiredTokens = function(userId){

		try {
			var destroyedCount = 0;
			var validCount = 0;
			UserModel.findById(userId,function(err,user){
				if(!err && user) {
					user.accessTokens(function (err, accessTokens) {
						if(err) debug(err);
						accessTokens.forEach(function (accessToken) {
							//debug(accessToken);
							if(err) debug(err);
							accessToken.validate(function (err, isValid){
								if(err) debug(err);
								if(isValid){
									validCount = validCount+1;
									//debug('Is still valid!', accessToken.id);
								} 
								else
									debug('Is no longer valid!');
									destroyedCount = +destroyedCount+1;
							})
						});
					});
				}
			}) 
		} catch (e) {
			debug(e);
		}
		//debug('AccessTokens: valid: %d, destroyed: %d',validCount,destroyedCount);
	}

	var config = {};
	try {
		
		var config = require( '../../providers.json' );
			
		config['negotiate'].failureRedirect = false;
		
		config['negotiate'].verifyMethod = (req, details, verified) => {
			
			debug('Negotiate verifyMethod');

			var userid = details.toString().replace( /@UK.PARKER.CORP/gi, "" ).replace( /@US.PARKER.CORP/gi, "" );

			var user = {
				id: userid.toString(),
				username: userid,
				email: userid + '@parker.com'
			};

			debug("details", userid);

			var OptionsForCreation = { autoLogin: true };

			var loginCallback = (req, done) => {
				return function(err, user, identity, token) {					
					debug( '\n\n\n err: %O', err );
					debug( '\n\n\n user: %O', user );
					debug( '\n\n\n identity: %O', identity );
					debug( '\n\n\n token: %O', token );

					if ( ! user ) done('No user in Login Callback!');

					if( user && 'id' in user ) deleteExpiredTokens(user.id);

					
					var authInfo = {
						identity: identity,
					};
					if (token) {
						req.accessToken = token;
						authInfo.accessToken = token;
					}
					debug('\n\n\n authInfo: %O', authInfo);
					//req.accessToken = token;
					
					done(err, user, authInfo);
				};
			};

			var OptionsForCreation = { 
				autoLogin: true,
				profileMapping: [
					{
						userField: "username",
						providerField: "id"
					},
					{
						userField: "email",
						providerField: "email"
					}
				],
			};

			return passportConfigurator.userIdentityModel.login( 
				'ldap',
				config['negotiate']['authScheme'], 
				user, {},
				OptionsForCreation,
				loginCallback(req, verified));			
		}
	
	} catch (err) {
		console.trace(err);
		process.exit(1); // fatal
	}

	passportConfigurator.init();
	passportConfigurator.setupModels( {
		userModel: app.models.user,
		userIdentityModel: app.models.userIdentity,
		userCredentialModel: app.models.userCredential,
		userAccessTokenModel: app.models.accessToken
	} );
	
	for (var s in config) {
		var c = config[s];
		c.session = c.session !== false;
		passportConfigurator.configureProvider(s, c);
	}


}