
module.exports = {
	run: async (ws, request) => {
		const playerID = request.Params.PlayerID;
		const partyID = request.Params.PartyID;
		const targetID = request.Params.TargetID;


		let party = Parties.find((p) => p.id === partyID);
		if (party) {
			if (party.leaderID === playerID) {
				party.setPartyLeader(targetID)
				logger.debug('[SetPartyLeader]', `${playerID} has set the party leader to ${targetID}`)
			} else {
				logger.error('[SetPartyLeader]', `${playerID} tried to set the party leader to ${targetID} in party ${party.id} but is not the leader.`)

			}

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




