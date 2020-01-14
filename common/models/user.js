module.exports = function ( User ) {
	
	User.observe('before *', async function(ctx) {
		console.log('Hello there!');
		return;
	});

	User.afterRemote('login', function (ctx, token, next) {
		User.findById(token.userId,function(err,user){
		if(!err && user) {
			var destroyedCount = 0;
			var validCount = 0;
			user.accessTokens(function (err, accessTokens) {
			accessTokens.forEach(function (accessToken) {
				accessToken.validate(function (err, isValid){
				if(isValid) validCount++;
				else
					destroyedCount++;
				})
			});
			console.log('AccessTokens: valid: %d, destroyed: %d',validCount,destroyedCount);
			});
		}
		});
		next();
	});

	User.observe('loaded', async (ctx) => {
		let user = ctx.data;

		if ( user.ADProfile && user.ADProfile.memberOf ){
			var tmpGroups = [ ...user.ADProfile.memberOf ];
			//console.log('group:', tmpGroups);
			
			user.ADProfile.memberOf = [];
			for ( var key in tmpGroups ) {
				user.ADProfile.memberOf.push( tmpGroups[ key ].split( ',' )[ 0 ].replace( 'CN=', '' ) );
			}
		}
		//console.log('User: %O', user);
		return;
	});
}