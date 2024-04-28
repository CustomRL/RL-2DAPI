module.exports = {
	run: async (ws, request) => {
		const playerID = request.Params.PlayerID;
		if (playerID) {
			return {
				"Friends": [
					{
						"VibeID": "123456789",
						"Status": "epic",
						"MOTD": "In training",
						"Username": "Toasteu"
					},
					{
						"VibeID": "ba95c73bf28bc82824896f43433aceef",
						"Status": "epic",
						"MOTD": "Main Menu",
						"Username": "Roasted Dominus"
					},
					{
						"VibeID": "123456789",
						"Status": "offline",
						"Username": "sjmpson"
					},
					{
						"VibeID": "123456789",
						"Status": "online",
						"Username": "sjmpsons #1 fan"
					}
				]
			}
		}
	}
}