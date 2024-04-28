'use strict'

const colors = require('colors');

colors.setTheme({
	log: 'grey',
	data: 'grey',
	help: 'cyan',
	verbose: 'cyan',
	prompt: 'grey',
	info: 'green',
	warn: 'yellow',
	debug: 'cyan',
	error: 'red',

});
const log = (msg) => console.log(`${colors.cyan(new Date().toUTCString())} ${msg}`),
	yellow = (m) => colors.yellow(m);


class Logger {
	constructor() { }

	log(source, msg) {
		let message = colors.log(msg)
		log(`${yellow(source)} | ${message}`);
	}

	info(source, msg) {
		let message = colors.info(msg)
		log(`${yellow(source)} | ${message}`);
	}

	warn(source, msg) {
		let message = colors.warn(msg)
		log(`${yellow(source)} | ${message}`);
	}

	error(source, msg) {
		let message = colors.error(msg)
		log(`${yellow(source)} | ${message}`);
	}

	data(source, msg) {
		let message = colors.data(msg)
		log(`${yellow(source)} | ${message}`);
	}

	debug(source, msg) {
		let message = colors.debug(msg)
		log(`${yellow(source)} | ${message}`);
	}

	mysql(source, msg) {
		let message = colors.data(msg)
		log(`${yellow(source)} | ${message}`);
	}
}

module.exports = new Logger();
