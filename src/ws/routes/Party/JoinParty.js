
module.exports = {
	run: async (ws, request) => {
		const playerID = request.Params.PlayerID;
		const partyID = request.Params.PartyID;

		let party = Parties.find((p) => p.id === partyID);
		if (party) {
			await party.addMember(playerID)
			logger.debug('[JoinParty]', `${playerID} has joined party ${party.id}`)

			return {
				"Party": {
					id: party.id,
					leaderID: party.leaderID,
					members: party.members,
					messages: party.messages
				}
			}
		} else {
			return {
				"Error": {
					Message: "Invalid Party"
				}
			}
		}

	}
}


var crypto = require('crypto');
const { getUserByID } = require('../../../mysql');
const logger = require('../../../logger');
const { Party } = require('./CreateParty');




