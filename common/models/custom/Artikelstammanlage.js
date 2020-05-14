var debug = require('debug')('loopback:models:Artikelstammanlage');
const debugArtikelstammanlage = true;
const app = require('../../../server/server.js');

module.exports = function ( Artikelstammanlage ) {

	Artikelstammanlage.remoteMethod(
		'sendNotification', {
			accepts: 	[
				{ arg: 'id', type: 'number', required: true}, 
				{ arg: 'department', type: 'string'},
				{ arg: 'options', type: 'object', http: 'optionsFromRequest'}
			],
			http: 		{  path: '/:id/sendNotification', verb: 'post', status: 201, errorStatus: 400},
			returns: 	{  arg: 'outcome', type: 'Boolean' }
		});

	Artikelstammanlage.sendNotification = async function(id, department, options) {
			
			const WebAppsConfig = app.models.WebAppsConfig;
			const EmailSender = app.models.Email;
			//const userCredentialModel = app.models.userCredentialModel;
			const ADUserModel = app.models.ADUser;


			const data = await Artikelstammanlage.findById(id);
			
			debug( 'Await findone: ', data );
			debug( 'Sending Emails to Department: %s', department );
			debug( 'ID: ', id );
			debug( 'data: ', data );
			
			let subject = 	'Artikelstammanlage - "' + data.artikelnummer + '"';
			let html = 		'<h2>Bitte folgende Artikelstammanlage bearbeiten:</h2>'

			// SETTING EMAIL ADRESSES
			let Emails = await WebAppsConfig.ArtikelstammanlageEmails({where: {name: department}});
			
			if ( department === 'starter') {
				Emails.push('markus.kristen@parker.com');
				Emails.push('daniel.zahn@parker.com');
			} 
			
			else if( department === 'ProcessEnd') {
				debug('Starter Name: ', data.startername);
				userInfo = await ADUserModel.findOne({where: {'username': data.startername}});
				debug('userInfo: ', userInfo);
				Emails.push({'value': userInfo.email});
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

			
			debug('Server Port: ', app.get('port'));
			
			let baseurl = '';
			if (app.get('port') === 3001){
				debug('Server is in development mode. Email to markus.kristen@parker.com');
				toArray = [ 'markus.kristen@parker.com' ];
				baseurl = 'http://lpce480webapps:3001';
			}
			else{
				baseurl = 'http://lpce480webapps';
			}

			html = html + 	
				'</br>Artikelnummer:&emsp;&emsp;<a href="' + baseurl + '"/#/pages/artikelstammanlage/anlageformular/' + data.id + '" >' + data.artikelnummer + '</a>' +
				'</br>RFQ-Nummer:&emsp;&emsp;' + data.rfqnr +
				'</br>Kunde:&emsp;&emsp;&emsp;&emsp;&emsp;' + data.Kunde
			
			let emailAdresses = Emails.map(Email => Email.value);
			
			debug('All Emails found: %o', emailAdresses)
			
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
						debug('email sentt to: %o', info);
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

    Artikelstammanlage.validatesPresenceOf( 	'artikelnummer' );
	Artikelstammanlage.validatesNumericalityOf( 'identnummer',      	   { allowBlank: true, allowNull: true, message: { number: 'is not a number'}} );
/*	Artikelstammanlage.validatesNumericalityOf( 'etikettennummer',         { allowBlank: true, allowNull: true, message: { number: 'is not a number'}} );
	Artikelstammanlage.validatesNumericalityOf( 'verpackungseinheit',      { allowBlank: true, allowNull: true, message: { number: 'is not a number'}} );
	//  Artikelstammanlage.validatesNumericalityOf( 'umverpackung',        { allowBlank: true, allowNull: true, message: { number: 'is not a number'}} );
	// Artikelstammanlage.validatesNumericalityOf( 'erstbestellungqty',    { allowBlank: true, allowNull: true, message: { number: 'is not a number'}} );
	Artikelstammanlage.validatesNumericalityOf( 'rfqnr',                   { allowBlank: true, allowNull: true, message: { number: 'is not a number'}} );
*/

	Artikelstammanlage.observe( 'before save', function ( ctx, next ) {

		var currentUser = ctx.options.currentUser.username;
		debug( 'CurrentUser:', currentUser );

		if ( ctx.isNewInstance ) {
			ctx.instance.startername = currentUser;
            ctx.instance.starterdatum = new Date();
		} else {			
            if ( ctx.data.startername === 'THISWASME' ){
                ctx.data.startername 	= currentUser;
                ctx.data.starterdatum 	= new Date();
            } else if ( ctx.data.manufacturingname === 'THISWASME' ){
                ctx.data.manufacturingname = currentUser;
                ctx.data.manufacturingdatum = new Date();
            } else if ( ctx.data.konstruktionname === 'THISWASME' ){
                ctx.data.konstruktionname = currentUser;
                ctx.data.konstruktiondatum = new Date();
            } else if ( ctx.data.serviceteamname === 'THISWASME' ){
                ctx.data.serviceteamname = currentUser;
                ctx.data.serviceteamdatum = new Date();
            } else if ( ctx.data.pricingname === 'THISWASME' ){
                ctx.data.pricingname = currentUser;
                ctx.data.pricingdatum = new Date();
            }
		}	

		debug( '\n> before save triggered for %O: \n %O', ctx.Model.modelName, ctx.instance || ctx.data );

		return next();
	} );


	// Nach dem Speichern eine neue HISTORY Version anlagen
	Artikelstammanlage.observe( 'after save', function ( ctx, next ) {

		var currentUser = ctx.options.currentUser.username;

		if (ctx.instance) {
			
			ctx.instance.username = currentUser;
			ctx.instance.changed = new Date();

			const AAVersion = JSON.parse(JSON.stringify(ctx.instance));
			delete AAVersion.aaId;
			
			//debug("AAVersion: %O", AAVersion);
			
			ctx.instance.versionen.create(AAVersion, function(err, data) {
				if (err) debug ('error: %O', err)

				else {
					if ( debugArtikelstammanlage ) debug ('Success: %O', data)
				}
			});

			debug('Upated the following: %o', ctx.instance);
			debug('Saved %s#%s \n\n\n %o', ctx.Model.modelName, ctx.instance.aaId,  ctx.instance);
  		} 
		
		return next();
	})

	function errorHandler(e) {
		debug (e);
	}

/*
	Artikelstammanlage.sendEmail = function(department, data ) {
		var lbctx = require('loopback-context').getCurrentContext({ bind: true });
		var currentUser = lbctx && lbctx.get( 'currentUserProfile' );
		const WebAppsConfig = app.models.WebAppsConfig;
		var toArray = [];

		debug('department: %s', department);

		if (department === 'Starter') {
			//toArray.push('markus.kristen@parker.com');
			toArray.push('daniel.zahn@parker.com');
		} else {
			WebAppsConfig.ArtikelstammanlageEmails({where: {name: department}}, function(err, Emails) {

				debug('All Emails found: %o', Emails)

				Emails.forEach(Email => {

					debug('One Email found: %o', Email);
					debug('Server Port: ', app.get('port'));
					
					if (app.get('port') === 3001){
						toArray.push('markus.kristen@parker.com');
						debug('Server is in developmode. Email to markus.kristen@parker.com');
					}
					else
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
						debug('email sentt to: %o', mail.accepted);
						if(err) return err;
					});
				});
				debug('Emails only found: %o', toArray)
			})
		}	
		
	}
*/

}
