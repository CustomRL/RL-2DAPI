const { decodeToken, generateToken } = require('../../src/tokenHandler');

const WebSocket = require('ws');
const types = require('./types')
const wss = new WebSocket.Server({ port: 8080 });
const fs = require('fs');
const { config } = require('../../config');
const { getSession } = require('../mysql');

clients = new Map();
const events = new Map();

const routes = fs.readdirSync('./src/ws/routes');
for (const route of routes) {
	const allEvents = fs.readdirSync(`./src/ws/routes/${route}`).map(f => f.split('.js')[0]);
	for (const event of allEvents) {
		events.set(event, require(`./routes/${route}/${event}.js`))
	}
}


console.log('[Socket] Starting server')

wss.on('connection', function connection(ws, req) {
	console.log('Client connected');

	const clientmesh = req.headers['sec-websocket-protocol']

	if (clientmesh) {
		let array = (clientmesh.split(', '))
		for (let i = 0; i < array.length; i += 2) {
			const key = array[i];
			const value = array[i + 1];
			req.headers[key.toLowerCase()] = value;
		}

	}

	const sessionID = req.headers.sessionid
	const playerID = req.headers.playerid
	const buildID = req.headers.vibebuildid;
	if (buildID !== config.FeatureSet) {
		ws.send(error("Version mismatch"));
		return ws.close();
	}
	if (!sessionID) return ws.close();

	for (const match of Matches) {
		match.PlayerLeft(playerID);
	}

	ws.on('close', function close() {
		if (sessionID) {
			clients.delete(playerID);
			for (const match of Matches) {
				match.PlayerLeft(playerID);
			}
			let p = Parties.find((p) => p.members.find((mem) => mem.PlayerID === playerID));
			if (p) {
				p.removeMember(playerID)
			}
		}
	});

	ws.on('error', (e) => {
		console.log(e);
	})

	ws.on('message', async function incoming(message) {
		try {
			const parsed = JSON.parse(message);
			let c = clients.get(playerID);
			if (!c) {
				let ses = await getSession({ PlayerID: playerID, SessionID: sessionID });
				if (ses.length < 1) {
					clients.delete(playerID);
					return ws.close();
				}
				clients.set(playerID, { session: ses[0], ws });
			}
			c = clients.get(playerID);

			let responses = [];

			for await (const request of parsed) {
				const e = events.get(request.Service?.split('/')[1]);
				console.log(request.Service);
				if (!e) {
					ws.send(error(`Invalid Service provided. ${request.Service}`))
					break;
				}
				let response = await e.run(ws, request, c.session);
				if (response !== undefined) {
					responses.push({
						Service: request.Service,
						Data: response
					});
				}

			}
			ws.send(JSON.stringify(responses))
		} catch (err) {
			console.log(err);
			ws.send(error("Invalid JSON provided."))
		}
	});
});


const error = (message) => {
	return JSON.stringify({
		id: types.ERROR,
		data: {
			message: message
		}
	})
}

