
module.exports = {
	run: async (ws, request) => {
		const playerID = request.Params.PlayerID;
		const partyID = request.Params.PartyID;
		const message = request.Params.Message;

		let party = Parties.find((p) => p.id === partyID);
		if (party) {
			party.sendPartyMessage(playerID, message)
			logger.debug('[SendPartyMessage]', `${playerID} sent message ${message} in party ${party.id}`)

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




