
module.exports = {
	run: async (ws, request) => {
		const playerID = request.Params.PlayerID;
		const inviteID = request.Params.InviteID;

		let party = Parties.find((p) => p.members.find((mem) => mem.PlayerID === playerID.split('Vibe|')[1]));
		if (!party) {
			let p = new Party(playerID);
			await p.addMember(playerID)
			Parties.push(p);
			party = p;
		}
		party.inviteMember(playerID, inviteID);
		logger.debug('[InvitePlayer]', `${playerID} has invited ${inviteID} to party ${party.id}`)

		if (playerID) {
			return {
				"Party": {
					id: party.id,
					leaderID: party.leaderID,
					members: party.members,
					messages: party.messages
				}
			}
		}


	}
}


var crypto = require('crypto');
const { getUserByID } = require('../../../mysql');
const logger = require('../../../logger');
const { Party } = require('./CreateParty');




