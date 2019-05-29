'use strict';

const loopback 	= require('loopback');
const promisify = require('util').promisify;
const fs 		= require('fs');
const prompts	= require('prompt');
const writeFile = promisify(fs.writeFile);
const readFile 	= promisify(fs.readFile);
const mkdirp 	= promisify(require('mkdirp'));

const DATASOURCE_NAME = 'qcd480d03JDE';
const dataSourceConfig = require('./server/datasources.json');
const db = new loopback.DataSource(dataSourceConfig[DATASOURCE_NAME]);




var properties = [ {
	name: 'table', 
	validator: /^[1-9a-zA-Z\s\-]+$/,
	warning: 'table must be only letters, spaces, or dashes'
}];

prompts.start();

prompts.get( properties, function ( err, result ) {
	if ( err ) { return onErr( err ); }
	console.log( 'Command-line input received:' );
	console.log( '  Table to abstract: ' + result.table );
	// console.log('  Model will be written to: ' + sqConfigRc.models-path);

	discover( result.table ).then(
		success => process.exit(),
		error => { console.error( 'UNHANDLED ERROR:\n', error ); process.exit( 1 ); })
} );



async function discover(table) {
  // It's important to pass the same "options" object to all calls
  // of dataSource.discoverSchemas(), it allows the method to cache
  // discovered related models
  const options = {relations: true};

  // Discover models and relations
  const dboSchema = await db.discoverSchemas(table, options);
  
  console.log(dboSchema);
  
  // Create model definition files
	await writeFile( 'common/models/custom/' + table + '.json', JSON.stringify( dboSchema[ 'dbo.' + table ], null, 2 ) );
	

  // Expose models via REST API
  const configJson = await readFile('server/model-config.json', 'utf-8');
  console.log('MODEL CONFIG', configJson);
  const config = JSON.parse(configJson);
  config[table] = {dataSource: DATASOURCE_NAME, public: true};
  await writeFile(
    'server/model-config.json',
    JSON.stringify(config, null, 2)
  );
	}

	
function onErr(err) {
	console.log(err);
	return 1;
}