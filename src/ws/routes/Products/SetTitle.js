const { getProducts, setActiveTitle } = require("../../../mysql");

module.exports = {
	run: async (ws, request) => {
		const playerID = request.Params.PlayerID.split('Vibe|')[1];
		const titleId = request.Params.TitleID;

		const { products, titles } = await getProducts({ PlayerID: playerID });

		setActiveTitle({ PlayerID: playerID, InstanceID: titleId })

		if (playerID) {
			return {
				"Message": [
					{ message: "Success" }
				]
			}
		}
	}
}


