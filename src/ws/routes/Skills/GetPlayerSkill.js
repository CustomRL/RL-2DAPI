


module.exports = {
	run: async (t) => {
		const playerID = request.Params.PlayerID;
		if (playerID) {
			return {
				"SkillRating": {
					RewardLevels: { SeasonLevel: 7, SeasonLevelWins: 0 },
					Skills: [
						{
							Division: 0,
							MatchesPlayed: 0,
							MMR: 25,
							PlacementMatchesPlayed: 0,
							Playlist: 0,
							Sigma: 8.33,
							Tier: 19,
							WinStreak: -1,
						},
					],
				}
			};



		}
	},
};
