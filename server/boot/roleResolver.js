module.exports = function ( app ) {
	var Role = app.models.Role;
	
	
	console.log("\n\n\n\n\n roleResolver check! \n\n\n\n\n");

	Role.registerResolver( 'ITmember', function ( role, context, cb ) {
		var WebApp = context.modelName;
		
		console.log("\n\n\n\n\n IT ADMIN CHECK \n\n\n\n\n");
		
		//Q: Is the user logged in? (there will be an accessToken with an ID if so)
		var userId = context.accessToken.userId;
		if ( !userId ) {
			//A: No, user is NOT logged in: callback with FALSE
			return process.nextTick( () => cb( null, false ) );
		}

		var userIdentity = app.models.userIdentity;
		userIdentity.findById( userId, function ( err, profile ) {
			if ( err ) return cb( err );
			if ( !profile ) return cb( new Error( "profile not found" ) );

			var userGroups = profile.profile._groups

			console.log('User Groups: %O', userGroups);
			
			if ( userGroups.indexOf( 'QCD480GGIT' ) ) return cb( null, true );
			else return cb(null, false);
		})

	} );

	Role.registerResolver( 'GGUsers', function ( role, context, cb ) {
		var WebApp = context.modelName;
		console.log("\n\n\n\n\n GG USERS CHECK \n\n\n\n\n");
		//Q: Is the user logged in? (there will be an accessToken with an ID if so)
		var userId = context.accessToken.userId;
		if ( !userId ) {
			//A: No, user is NOT logged in: callback with FALSE
			return process.nextTick( () => cb( null, false ) );
		}

		var userIdentity = app.models.userIdentity;
		userIdentity.findById( userId, function ( err, profile ) {
			if ( err ) return cb( err );
			if ( !profile ) return cb( new Error( "profile not found" ) );

			var userGroups = profile.profile._groups

			console.log('User Groups: %O', userGroups);
			
			if ( userGroups.indexOf( 'QCD480GGUsers' ) ) return cb( null, true );
			else return cb(null, false);
		})

	} );

	Role.registerResolver( 'WebAppReader', function ( role, context, cb ) {
		var WebApp = context.modelName;

		console.log ('WebApp: %O', WebApp);

		//Q: Is the user logged in? (there will be an accessToken with an ID if so)
		var userId = context.accessToken.userId;

		if ( !userId ) {
			//A: No, user is NOT logged in: callback with FALSE
			return process.nextTick( () => cb( null, false ) );
		}

		var userIdentity = app.models.userIdentity;
		userIdentity.findById( userId, function ( err, profile ) {
			if ( err ) return cb( err );
			if ( !profile ) return cb( new Error( "profile not found" ) );

			var userGroups = profile.profile._groups

			var ADWebAppReaderGroup = 'QCD480GG_WEB_' + WebApp.toUpperCase(); + '_READ';

			if ( WebApp === 'OpenOrders' || WebApp === 'OpenOrdersComment')
				ADWebAppReaderGroup = 'QCD480GG_WEB_OpenOrders';

			if ( WebApp === 'Artikelstammanlage' || WebApp === 'ArtikelstammanlageHistorie' )
				ADWebAppReaderGroup = 'QCD480GG_WEB_Artikelstammanlage';
			
			//console.log( 'user: ' + profile.profile.uid + ' member of ' + ADWebAppReaderGroup + ' true if >0: ' + userGroups.indexOf( ADWebAppReaderGroup ) );

			if ( userGroups.indexOf( ADWebAppReaderGroup ) ) return cb( null, true );
			else return cb(null, false);
		})

	} );

	Role.registerResolver( 'WebAppWriter', function ( role, context, cb ) {
		var WebApp = context.modelName;

		console.log ('WebApp: %O', WebApp);


		//Q: Is the user logged in? (there will be an accessToken with an ID if so)
		var userId = context.accessToken.userId;
		if ( !userId ) {
			//A: No, user is NOT logged in: callback with FALSE
			return process.nextTick( () => cb( null, false ) );
		}

		var userIdentity = app.models.userIdentity;
		userIdentity.findById( userId, function ( err, profile ) {
			if ( err ) return cb( err );
			if ( !profile ) return cb( new Error( "profile not found" ) );

			var userGroups = profile.profile._groups

			var ADWebAppReaderGroup = 'QCD480GG_WEB_' + WebApp.toUpperCase() + '_WRITE';
			
			if ( WebApp === 'OpenOrders' || WebApp === 'OpenOrdersComment' )
				ADWebAppReaderGroup = 'QCD480GG_WEB_OpenOrders'

			if ( WebApp === 'Artikelstammanlage' || WebApp === 'ArtikelstammanlageHistorie' )
				ADWebAppReaderGroup = 'QCD480GG_WEB_Artikelstammanlage'
			
			//console.log( 'user: ' + profile.profile.uid + ' member of ' + ADWebAppReaderGroup + ' true if >0: ' + userGroups.indexOf( ADWebAppReaderGroup ) );

			if ( userGroups.indexOf( ADWebAppReaderGroup ) ) return cb( null, true );
			else return cb(null, false);
		})

	} );
};