const crypto = require('crypto');

const config = {
	secret: "2b26153a61ed155be9a2f44edd4b4bdbfc716b7",
	FeatureSet: "PrimeUpdate1_0"
}

module.exports.config = config;


module.exports.generateHexString = (length = 32) => {
	return crypto.randomBytes(Math.ceil(length / 2))
		.toString('hex')
		.slice(0, length);
}

module.exports.Types = {
	"NoService": "No service was provided",
	"InvalidService": "Invalid service was provided",
	"InvalidUser": "Invalid user ticket was provided",
	"VersionMismatch": "Version mismatch",
	"FeatureMismatch": "Feature version mismatch",
	"InvalidLoginDetails": "No valid user valid for those login details",
	"NoLoginDetails": "No user credentials were provided",
}