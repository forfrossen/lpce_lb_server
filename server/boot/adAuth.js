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
		
		config['ad'].getUserNameFromHeader = ( req ) => {
			return req.kerbUserId;

		}
		
		
		// If using custom passport module
		//config['negotiate'].verifyMethod = (req, principal, verified) => {
		config['msad'].getUserNameFromHeader = ( req ) => {
			debug('msad getUserNameFromHeader');
			var userid;
			debug ('req.kerbUserId: ', req.kerbUserId)
			debug ('req.user: ', req.user)
			//debug ('req: ', req)

			if( req.user){
				debug ('req.user: ', req.user.username.replace('negotiate.', ''))
				userid = req.user.username.replace('negotiate.', '');
				req.kerbUserId = req.user.username.replace('negotiate.', '');
			}

			if(req.accessToken){
				debug ('Access Token available in request! Hoorraaayy!: ', req.accessToken );

				UserModel.findById(req.accessToken.userId, function(err, user){

					if ( err ) debug(  new Error(err ));

					if ( !user ) debug( new Error( 'No user with this access token was found.' ) );
					debug( 'User: ', user );
					req.kerbUserId = user.username;
				} );
			}

			return req.kerbUserId;
		}

		
		config['negotiate'].failureRedirect = false;
		
		config['negotiate'].verifyMethod = (req, details, verified) => {
			
			debug('Negotiate verifyMethod');

			var userid = details.replace( /@UK.PARKER.CORP/gi, "" ).replace( /@US.PARKER.CORP/gi, "" );
			var user = {
				id: userid,
				username: userid,
				email: userid + '@parker.com'
			};

			debug("details", userid);
			//verified(null, user);

			var OptionsForCreation = { autoLogin: true };

			var loginCallback = (req, done) => {
				return function(err, user, identity, token) {					
					debug( '\n\n\n err: %O', err );
					debug( '\n\n\n user: %O', user );
					debug( '\n\n\n identity: %O', identity );
					debug( '\n\n\n token: %O', token );

					if( 'id' in user) deleteExpiredTokens(user.id);

					
					var authInfo = {
						identity: identity,
					};
					if (token) {
						req.accessToken = token;
						authInfo.accessToken = token;
					}
					debug('\n\n\n authInfo: %O', authInfo);
					//req.accessToken = token;
					//req.access_token = token;
					
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
						userField: "id",
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



		config['msad'].verifyMethod = (req, user, verified) => {

			debug('MSAD verifyMethod');
			debug("user", user);

			var OptionsForCreation = { autoLogin: true };

			var loginCallback1 = (req, done) => {
				return function(err, user, identity, token) {
					/*
					if(user.email !== req.user.email) {
						user.updateAttributes({email: req.user.email}, (err, i) => {
							if (err) debug('err:', err);
							debug('INFO: ', i);
						})
					}
					*/
					deleteExpiredTokens(user.id);

					var authInfo = {
						identity: identity,
					};
					if (token) {
						authInfo.accessToken = token;
					}
					done(err, user, authInfo);
				};
			};

			user.email = user.emails[0].value;			
			user.username = user._json.sAMAccountName;
			user.id = user._json.sAMAccountName;
			//req.user.email = user.email;

			var tmpGroups = user._json.memberOf;
			//debug('group:', tmpGroups);
			user[ '_groups' ] = [];
			for ( var key in tmpGroups ) {
				var group = tmpGroups[ key ];
				var niceGroup = group.split( ',' )[ 0 ].replace( 'CN=', '' );
				//debug('group:', group);
				//debug('roup.split(,)[0]:', group.split(',')[0]);
				//debug('nice group:', niceGroup);
				user[ '_groups' ].push( niceGroup );
			}

			delete user.memberOf;

			

			var OptionsForCreation = { 
			//	autoLogin: true
			};

			
			return passportConfigurator.userCredentialModel.link( 
				req.accessToken.userId,
				'ldap',
				config['msad']['authScheme'], 
				user, {},
				OptionsForCreation,
				loginCallback1(req, verified));	
			
			/*
			return passportConfigurator.userIdentityModel.login( 
				'ldap',
				config['msad']['authScheme'], 
				user, {},
				OptionsForCreation,
				loginCallback(req, verified));			
			*/
		}
		

/*
		config['negotiate'].verifyMethod = (req, details, verified) => {

			//debug('verified:', verified);
			
			var ADUserModel = app.models.ADUser;
			var UserModel = app.models.User;
			var userid = details.replace( /@UK.PARKER.CORP/gi, "" ).replace( /@US.PARKER.CORP/gi, "" );
			
			debug('verifying now!', userid);
			
			//userid='asdf';

			var loginCallback = (req, done) => {
				return function(err, user, identity, token) {
					
					debug( '\n\n\n err: %O', err );
					debug( '\n\n\n user: %O', user );
					debug( '\n\n\n identity: %O', identity );
					debug( '\n\n\n token: %O', token );
					
					var authInfo = {
						identity: identity,
					};
					if (token) {
						authInfo.accessToken = token;
					}
					done(err, user, authInfo);
				};
			};
			var OptionsForCreation = { autoLogin: true };



			UserModel.findOne({ "where": { "username": 'negotiate.' + userid } }, function(err, user) {
				debug('User:', user);
				if( user ){
					
					return verified(null, user);
					passportConfigurator.userIdentityModel.login( config['negotiate']['provider'], config['negotiate']['authScheme'], user, {},
							OptionsForCreation, loginCallback(req, verified));
					
				} else {
					ADUserModel.findOne({ "where": { "username": userid } }, function(err, user) {
						if (err) {
							debug( 'Error: ', err);
							return verified(err, null);
						}

						if ( !user ) {
							var error = 'No user found in Database';
							debug( error );
							return verified(error, null);
						}
						
						//debug( 'User found in Database: ', user);
						return verified(null, details, user);


				



						//debug('\n\n\n login CALLBACK: ',  this.loginCallback, '\n\n\n');
						//debug('\n\n\n passportConfigurator!: ',  passportConfigurator, '\n\n\n');

						passportConfigurator.userIdentityModel.login( config['negotiate']['provider'], config['negotiate']['authScheme'], user, {},
							OptionsForCreation, loginCallback(req, verified));	

					});
				}
			});
		}
*/
	
		
		
		//debug( 'Config: %O', config['ad2'] );
	
	} catch (err) {
		console.trace(err);
		process.exit(1); // fatal
	}


	  
	passportConfigurator.init();
	
	//debug( 'Config: %O', config );
	passportConfigurator.setupModels( {
		userModel: app.models.user,
		userIdentityModel: app.models.userIdentity,
		userCredentialModel: app.models.userCredential,
		userAccessTokenModel: app.models.accessToken
	} );
	//passportConfigurator.configureProvider( 'negotiate1', config );
	//passportConfigurator.configureProvider( 'ad', config.ad );
	
	for (var s in config) {
		var c = config[s];
		c.session = c.session !== false;
		passportConfigurator.configureProvider(s, c);
	}


}