
module.exports = {
	run: async (ws, request) => {
		const playerID = request.Params.PlayerID;

		let p = new Party(playerID);
		await p.addMember(playerID)
		Parties.push(p);

		logger.debug('[CreateParty]', `${playerID} created party: ${p.id}`);

		if (playerID) {
			return {
				"Party": {
					id: p.id,
					leaderID: p.leaderID,
					members: p.members,
					messages: p.messages
				}
			}
		}
	}
}

Parties = [];

var crypto = require('crypto');
const { getUserByID } = require('../../../mysql');
const logger = require('../../../logger');


const partyID = () => {
	return crypto.randomBytes(Math.ceil(12 / 2)).toString('hex').slice(0, 12);
}

const parseVibeID = (id) => {
	return id.split("|")[1] || id;
}


class Party {
	constructor(creatorID) {
		this.id = partyID();
		this.leaderID = parseVibeID(creatorID);
		this.members = [];
		this.createdAt = Date.now();
		this.messages = [
			{
				Type: "message",
				PlayerID: "i23402834",
				PlayerName: "Custom",
				Message: "testing testing 123"
			},
		];
	}

	async addMember(userID) {
		const user = (await getUserByID({ PlayerID: parseVibeID(userID) }))[0];

		this.members = this.members.filter((mem) => mem.PlayerID !== user.PlayerID);

		this.members.push({
			PlayerID: user.PlayerID,
			PlayerName: user.PlayerName,
			Avatar: "https://avatars.cloudflare.steamstatic.com/b3d1c6656d7023920de7815f6e9ad40c37636747_full.jpg"
		})

		this.sendPartyMessage(user.PlayerID, `${user.PlayerName} joined the party`, 'state');

		this.updateParty();

		return true;
	};

	sendPartyMessage(targetID) {
		this.leaderID = targetID;
		this.updateParty();
		return true;
	}

	sendPartyMessage(playerID, message, type = 'message') {
		this.messages.push({
			Type: type,
			PlayerID: playerID,
			PlayerName: this.members.find((m) => m.PlayerID === parseVibeID(playerID))?.PlayerName || "Unknown",
			Message: message
		});
		this.updateParty();
	}

	removeMember(userID) {
		let mem = this.members.find((mem) => mem.PlayerID === parseVibeID(userID));
		this.members = this.members.filter((mem) => mem.PlayerID !== parseVibeID(userID));
		this.sendPartyMessage(userID, `${mem?.PlayerName} left the party`, 'state');

		this.updateParty();

	}

	updateParty() {

		let responses = [{
			Service: "Party/JoinParty",
			Data: {
				"Party": {
					id: this.id,
					leaderID: this.leaderID,
					members: this.members,
					messages: this.messages
				}
			}
		}];

		for (const member of this.members) {
			const id = parseVibeID(member.PlayerID);
			const client = clients.get(id);
			if (client) {
				client.ws.send(JSON.stringify(responses))
			} else {
				// Remove from party boot
			}
		}
	}

	inviteMember(fromID, userID) {
		let m = this.members.find((m) => m.PlayerID === parseVibeID(fromID));

		let invitee = clients.get(parseVibeID(userID));
		if (invitee) {
			let responses = [];

			let serv = {
				"Alert": {
					Message: `has invited you to join their Party`,
					Timestamp: Date.now() + 5000,
					Type: "PartyInvite",
					Inviter: m,
					PartyID: this.id
				}
			}

			responses.push({
				Service: "Friend/Alert",
				Data: serv
			});

			invitee.ws.send(JSON.stringify(responses));
		} else {
			logger.error('[CreateParty]', `${fromID} tried to invite ${userID} who is offline.`)
		}
	}
}

module.exports.Party = Party;
