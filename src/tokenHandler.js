function generateToken(userId, timestamp = Date.now()) {
	timestamp = Math.floor(timestamp / 1000);
	// Convert user id to base64
	const userIdBase64 = Buffer.from(userId.toString()).toString('base64');

	// Convert timestamp to base64
	const timestampBase64 = Buffer.from(timestamp.toString()).toString('base64');

	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const randomString = userIdBase64 + '.' +
		Array.from({ length: 6 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('') +
		'.' + timestampBase64;

	return randomString;
}

function decodeToken(token) {
	const parts = token.split('.');

	// Decode the first part (user id)
	const userId = Buffer.from(parts[0], 'base64').toString('utf-8');

	// Decode the third part (timestamp)
	const timestamp = Buffer.from(parts[2], 'base64').toString('utf-8');

	return {
		id: userId,
		timestamp: timestamp
	};
}

module.exports = { decodeToken, generateToken }
