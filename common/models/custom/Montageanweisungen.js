	
const debugArtikelstammanlage = false;
const app = require('../../../server/server.js');
//var UserIdentity 	= app.models.UserIdentity;
var LoopBackContext = require('loopback-context');

module.exports = function ( Montageanweisung ) {

	function errorHandler(e) {
		console.log (e);
	}

		// Nach dem Speichern eine neue HISTORY Version anlagen
	Montageanweisung.observe( 'after save', async  function ( ctx ) {

		var lbctx = require('loopback-context').getCurrentContext({ bind: true });
		const EmailSender = app.models.Email;


		const Emails 	= ['QCDE-Nussdorf-Quality@parker.com', 'QCDE.KS@parker.com'];
		let html 		=  '<h2>Bitte Montageanweisung überprüfen</h2>';
		let subject		=  '';

		if (ctx.instance) {
			subject = 	'Montageanweisung für Artikel: "' + ctx.instance.artikel + '" wurde geändert!';
			html = html + 'Artikel: ' + ctx.instance.artikel
  		} else {
			subject = 	'Montageanweisung für Artikel: "' + ctx.data.artikel + '" wurde geändert!';
			html = html + 'Artikel: ' + ctx.data.artikel
		}
		html = html + '<br/ ><br/ ><a href="http://lpce480webapps/#/pages/enovia/montageanleitungen">Montageanleitungen + Anweisungen - Suche</a>';

		let sendEmails = () => {
			return new Promise((resolve, reject) => {
				EmailSender.send({
					to: 'markus.kristen@parker.com', //Email.value
					//to: 		Emails,
					from: 		'LPCE-Nussdorf-Webapps@parker.com',
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
	})
}