const config = require("../../../config.js");
const mysql = require("../../mysql");
const randomName = require('../../../src/randomName.js');
const { generateToken, decodeToken } = require("../../tokenHandler.js");

const url = `ws://localhost:8080`

module.exports = {
	expected: {
		Version: 1,
		ID: 1,
	},
	async run({ res, body }) {
		const { Platform, PlayerID,
			AuthTicket, FeatureSet,
			VibeAccountID } = body.Params;

		if (!AuthTicket && !PlayerID) {
			// We can assume the user is trying to register, as they don't exist.
			let name = randomName(),
				randomID = config.generateHexString(),
				token = generateToken(randomID)

			let response = await mysql.createUser({ PlayerID: randomID, PlayerName: name, Token: token })
			loginSuccess(res, { PlayerID: randomID, PlayerName: name, Ticket: token, id: response.insertId, Admin: false })
			return;
		}

		let foundAuth = await mysql.findAuthUser({ PlayerID, Ticket: AuthTicket });
		if (foundAuth.length < 1) {
			return res.status(400).send(error("InvalidLoginDetails"));
		}
		loginSuccess(res, foundAuth[0])
	}
}



async function loginSuccess(res, params) {
	let socketSession = {
		SessionID: crypto.randomUUID(),
		PlayerID: params.PlayerID,
		expiresAt: (new Date().getTime() / 1000).toFixed(0),
		AuthTicket: params.Ticket,
		PlayerName: params.PlayerName,
		Admin: !!params.Admin
	};
	socketSession.PerConURL = `${url}`
	await mysql.addSession(socketSession)
	res.json(socketSession);
}

const WebSocket = require('ws');

var reconnectInterval = 1000 * 5
var socket;
var connect = function () {
	// socket = new WebSocket('ws://localhost:8080', {
	// 	headers: {
	// 		"SessionID": "b2c61158-c14f-4246-9d7a-20f7722cde60",
	// 		"PlayerID": "63cd8c2bdd054b7d0c1713941d5dc84d",
	// 		"expiresAt": "1713160697",
	// 		'VibeBuildID': config.config.FeatureSet,
	// 	}
	// });
	// socket.on('open', function () {

	// 	let msgBody = JSON.stringify([
	// 		{
	// 			Service: 'Products/GetPlayerProducts',
	// 			Params: {
	// 				PlayerID: 'Vibe|' + `63cd8c2bdd054b7d0c1713941d5dc84d`
	// 			}
	// 		},
	// 		{
	// 			Service: 'Products/GetPlayerSkill',
	// 			Params: {
	// 				PlayerID: 'Vibe|' + `63cd8c2bdd054b7d0c1713941d5dc84d`
	// 			}
	// 		}
	// 	]);
	// 	socket.send(msgBody);

	// });
	// socket.on('error', function () {
	// });
	// socket.on('message', (m) => {
	// 	console.log(m.toString())
	// })
	// socket.on('close', function (e) {
	// 	setTimeout(connect, reconnectInterval);
	// });
};
// connect();

const error = (type) => {
	return ({ "Responses": [{ "ID": 1, "Error": { "Type": type, "Message": config.Types[type] } }] })
}