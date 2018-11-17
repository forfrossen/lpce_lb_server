module.exports = {
	apps: [ {

		name					: 'LPCE WebApps - Development',	
		cwd						: '/var/www/node/develop/lpce-webapps/server',
		args					: '',
		script					: 'server.js',

		out_file				: `log/debug.log`,
		error_file				: `log/error.log`,
		log_date_format			: 'YYYY-MM-DD HH:mm:ss: Z',

		instances				: 1,
		max_restarts   			: 10,
		min_uptime				: '10s',
		autorestart				: false,
		watch					: false,
		ignore_watch 			: ["[\\/\\\\]\\./", "node_modules", "db.json", "client", "logs"],
		max_memory_restart		: '1G',

		env: {
			NODE_ENV			: "development",
		},
	}],

	deploy: {
		production: {
			user: 'node',
			host: '212.83.163.1',
			ref: 'origin/master',
			repo: 'git@github.com:repo.git',
			path: '/var/www/production',
			'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
		}
	}
};
