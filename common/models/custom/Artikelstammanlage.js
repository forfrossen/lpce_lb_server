
const debugArtikelstammanlage = false;
const app = require('../../../server/server.js');
//var UserIdentity 	= app.models.UserIdentity;
var LoopBackContext = require('loopback-context');

module.exports = function ( Artikelstammanlage ) {

	const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));


	Artikelstammanlage.remoteMethod(
		'sendNotification', {
			accepts: 	[{ arg: 'id', type: 'number', required: true}, {arg: 'department', type: 'string'}, ],
			http: 		{  path: '/:id/sendNotification', verb: 'post', status: 201, errorStatus: 400},
			returns: 	{  arg: 'outcome', type: 'Boolean' }
		});

	Artikelstammanlage.sendNotification = async function(id, department) {
			
			var lbctx = require('loopback-context').getCurrentContext({ bind: true });
			var currentUser = lbctx && lbctx.get( 'currentUserProfile' );
			const WebAppsConfig = app.models.WebAppsConfig;
			const EmailSender = app.models.Email;
			const userCredentialModel = app.models.userCredentialModel;


			const data = await Artikelstammanlage.findById(id);
			
			// console.log( 'Await findone: ', data);
			// console.log('Sending Emails to Department: %s', department);
			
			//console.log('ID: ', id);
			//console.log('data: ', data);
			
			let subject = 	'Artikelstammanlage - "' + data.artikelnummer + '"';
			let html = 		'<h2>Bitte folgende Artikelstammanlage bearbeiten:</h2>'

			// SETTING EMAIL ADRESSES
			let Emails = await WebAppsConfig.ArtikelstammanlageEmails({where: {name: department}});
			
			if ( department === 'starter') {
				Emails.push('markus.kristen@parker.com');
				Emails.push('daniel.zahn@parker.com');
			} 
			
			else if( department === 'ProcessEnd') {
				//console.log('Starter Name: ', data.startername);
				userInfo = await userCredentialModel.findOne({where: {'profile.id': data.startername}});
				//console.log('userInfo: ', userInfo);				
				Emails.push({'value': userInfo.profile.email});
				subject = subject + ' - wurde angelegt!';
				html = 		'<h2>Der folgende Artikel hat den Anlage-Prozess komplett durchlaufen:</h2>';
			}
			
			else if ( ! Emails.length ) {
				var error = new Error();
				error.name = 'Email Address Lookup Error';
				error.message = 'Keine Empfaenger Email Adressen gefunden!';
				error.status = 423;
				throw error;
			}

			let baseurl = (app.get('port') === 3001) ? 'http://lpce480webapps:3001' : 'http://lpce480webapps';

			html = html + 	
				'</br>Artikelnummer:&emsp;&emsp;<a href="' + baseurl + '"/#/pages/artikelstammanlage/anlageformular/' + data.id + '" >' + data.artikelnummer + '</a>' +
				'</br>RFQ-Nummer:&emsp;&emsp;' + data.rfqnr +
				'</br>Kunde:&emsp;&emsp;&emsp;&emsp;&emsp;' + data.Kunde
			
			let emailAdresses = Emails.map(Email => Email.value);
			
			//console.log('All Emails found: %o', emailAdresses)
			
			let sendEmails = () => {
				return new Promise((resolve, reject) => {
					EmailSender.send({
						// to: 'markus.kristen@parker.com', //Email.value
						to: 		emailAdresses,
						from: 		'LPCE-Nussdorf-Artikelstammanlage@parker.com',
						subject:	subject,
						html: 		html
					}, (err, info, response) => {
						if (err) reject(err);
						console.log('email sentt to: %o', info);
						resolve(info);
					})});
			}

			let isEmailsSent = await sendEmails();

			if ( isEmailsSent ) {
				return true;
			} else {
				var error = new Error();
				error.name = 'Email sending error';
				error.message = 'Emails konnten nicht verschickt werden!';
				error.status = 423;
				throw error;
			}

	} 
	//Artikelstammanlage.hasOne( UserIdentity, { foreignKey: 'external', as: 'starter'} );


	//Artikelstammanlage.nestRemoting('version');
	//Artikelstammanlage.versions.create({});

    Artikelstammanlage.validatesPresenceOf( 	'artikelnummer' );
	Artikelstammanlage.validatesNumericalityOf( 'identnummer',      	   { allowBlank: true, allowNull: true, message: { number: 'is not a number'}} );
/*	Artikelstammanlage.validatesNumericalityOf( 'etikettennummer',         { allowBlank: true, allowNull: true, message: { number: 'is not a number'}} );
	Artikelstammanlage.validatesNumericalityOf( 'verpackungseinheit',      { allowBlank: true, allowNull: true, message: { number: 'is not a number'}} );
	//  Artikelstammanlage.validatesNumericalityOf( 'umverpackung',        { allowBlank: true, allowNull: true, message: { number: 'is not a number'}} );
	// Artikelstammanlage.validatesNumericalityOf( 'erstbestellungqty',    { allowBlank: true, allowNull: true, message: { number: 'is not a number'}} );
	Artikelstammanlage.validatesNumericalityOf( 'rfqnr',                   { allowBlank: true, allowNull: true, message: { number: 'is not a number'}} );
*/

	Artikelstammanlage.observe( 'before save', function ( ctx, next ) {

		var lbctx = LoopBackContext.getCurrentContext();


		var currentUserProfile = lbctx && lbctx.get( 'currentUserProfile' );
		var currentUser = lbctx && lbctx.get( 'currentUser' );
		
		/*
		console.log( 'CurrentUser:', currentUser );
		console.log( 'ctx.options:', ctx.options );
		console.log( 'CurrentUserId:', ctx.options.currentUser.id );
		*/

		if ( debugArtikelstammanlage ) console.log( 'About to save following insance:\n %O', ctx.instance );

		if ( ctx.isNewInstance ) {
			ctx.instance.startername = currentUser;
            ctx.instance.starterdatum = new Date();
		} else {
			
			/*
			var to 				= 'markus.kristen@parker.com';
			var id				= ctx.data.aaId;
			var artikelnummer	= ctx.data.artikelnummer;
			*/

			// var nextDepartment  = ''

            if ( ctx.data.startername === 'THISWASME' ){
                ctx.data.startername 	= currentUser;
                ctx.data.starterdatum 	= new Date();
				// nextDepartment			= 'Manufacturing';
            } else if ( ctx.data.manufacturingname === 'THISWASME' ){
                ctx.data.manufacturingname = currentUser;
                ctx.data.manufacturingdatum = new Date();
				// nextDepartment			= 'Konstruktion';
            } else if ( ctx.data.konstruktionname === 'THISWASME' ){
                ctx.data.konstruktionname = currentUser;
                ctx.data.konstruktiondatum = new Date();
				// nextDepartment			= 'ServiceTeam';
            } else if ( ctx.data.serviceteamname === 'THISWASME' ){
                ctx.data.serviceteamname = currentUser;
                ctx.data.serviceteamdatum = new Date();
				// nextDepartment			= 'Pricing';
            } else if ( ctx.data.pricingname === 'THISWASME' ){
                ctx.data.pricingname = currentUser;
                ctx.data.pricingdatum = new Date();
				// nextDepartment			= 'Starter';
            }

			// Artikelstammanlage.sendEmail(nextDepartment, ctx.data);
		}

		

		if ( debugArtikelstammanlage ) console.log( '\n> before save triggered for %O: \n %O', ctx.Model.modelName, ctx.instance || ctx.data );

		return next();
	} );


	// Nach dem Speichern eine neue HISTORY Version anlagen
	Artikelstammanlage.observe( 'after save', function ( ctx, next ) {

		var lbctx = require('loopback-context').getCurrentContext({ bind: true });
		var currentUser = lbctx && lbctx.get( 'currentUser' );

		if (ctx.instance) {
			
			ctx.instance.username = currentUser;
			ctx.instance.changed = new Date();

			const AAVersion = JSON.parse(JSON.stringify(ctx.instance));
			delete AAVersion.aaId;
			
			//console.log("AAVersion: %O", AAVersion);
			
			ctx.instance.versionen.create(AAVersion, function(err, data) {
				if (err) console.log ('error: %O', err)

				else {
					if ( debugArtikelstammanlage ) console.log ('Success: %O', data)
				}
			});

			//console.log('Upated the following: %o', ctx.instance);
			if ( debugArtikelstammanlage ) console.log('Saved %s#%s \n\n\n %o', ctx.Model.modelName, ctx.instance.aaId,  ctx.instance);
  		} 
		
		return next();
	})

	function errorHandler(e) {
		console.log (e);
	}


	Artikelstammanlage.sendEmail = function(department, data ) {
		var lbctx = require('loopback-context').getCurrentContext({ bind: true });
		var currentUser = lbctx && lbctx.get( 'currentUserProfile' );
		const WebAppsConfig = app.models.WebAppsConfig;
		var toArray = [];

		console.log('department: %s', department);

		if (department === 'Starter') {
			toArray.push('markus.kristen@parker.com');
			toArray.push('daniel.zahn@parker.com');
		} else {
			WebAppsConfig.ArtikelstammanlageEmails({where: {name: department}}, function(err, Emails) {
				//console.log('All Emails found: %o', Emails)
				Emails.forEach(Email => {
					//console.log('One Email found: %o', Email)
					toArray.push(Email.value)
					Artikelstammanlage.app.models.Email.send({
						// to: 'markus.kristen@parker.com', //Email.value
						to: 		Email.value,
						from: 		'LPCE-Nussdorf-Artikelstammanlage@parker.com',
						subject:	'Artikelstammanlage - ' + data.artikelnummer,
						html: 		'<h2>Bitte folgende Artikelstammanlage bearbeiten:</h2>' +
									'</br>Artikelnummer:&emsp;&emsp;<a href="http://lpce480webapps:3001/#/pages/artikelstammanlage/anlageformular/' + data.id + '" >' + data.artikelnummer + '</a>' +
									'</br>RFQ-Nummer:&emsp;&emsp;' + data.rfqnr +
									'</br>Kunde:&emsp;&emsp;&emsp;&emsp;&emsp;' + data.Kunde
					}, function(err, mail) {
						console.log('email sentt to: %o', mail.accepted);
						if(err) return err;
					});
				});
				//console.log('Emails only found: %o', toArray)
			})
		}	
		
	}

}
