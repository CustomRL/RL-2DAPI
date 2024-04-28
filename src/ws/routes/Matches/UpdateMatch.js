module.exports = {
	run: async (ws, request, session) => {
		const playerID = request.Params.PlayerID;
		const updatePath = request.UpdatePath;
		const updateValue = request.Value;

		const teams = {
			SetBlueTeam: 0,
			SetOrangeTeam: 1,
			SetSpectatorTeam: 2
		}

		if (updatePath === 'UpdateTime') {
			for (const m of Matches) {
				for (const team of m.teams) {
					for (const player of team.players) {
						if (player.PlayerID === playerID) {
							if (m.checkAdmin(playerID)) {
								console.log('Player is actually an admin');
								console.log(updateValue)
								m.addTime(updateValue);
							}
						}
					}
				}
			}
		}

		if (updatePath === 'Pause') {
			for (const m of Matches) {
				for (const team of m.teams) {
					for (const player of team.players) {
						if (player.PlayerID === playerID) {
							if (m.checkAdmin(playerID)) {
								m.pause(playerID);
							}
						}
					}
				}
			}
		}

		if (updatePath === 'Resume') {
			for (const m of Matches) {
				for (const team of m.teams) {
					for (const player of team.players) {
						if (player.PlayerID === playerID) {
							if (m.checkAdmin(playerID)) {
								m.unpause(playerID);
							}
						}
					}
				}
			}
		}

		if (Object.keys(teams).includes(updatePath)) {
			for (const m of Matches) {
				for (const team of m.teams) {
					for (const player of team.players) {
						if (player.PlayerID === playerID) {
							m.SetTeam(playerID, teams[updatePath]);
						}
					}
				}
			}
		}

		if (updatePath === 'LeaveMatch') {
			for (const m of Matches) {
				for (const team of m.teams) {
					for (const player of team.players) {
						if (player.PlayerID === playerID) {
							m.PlayerLeft(playerID);
						}
					}
				}
			}

		}

		if (playerID) {
			return {
				message: "Success"
			};
		}
	},
};
