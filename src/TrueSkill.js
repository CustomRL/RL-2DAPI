// Install the 'mathjs' library using 'npm install mathjs'
const math = require('mathjs');

const DEFAULT_SIGMA = 8.333,
	DEFAULT_MU = 25;

// Initialize player ratings (mean and standard deviation)

// Calculate team ratings (average of player ratings)
function calculateTeamRating(players, team) {
	const ratings = team.map(player => players[player]);
	const muSum = ratings.reduce((sum, player) => sum + player.mu, 0);
	const sigmaSum = ratings.reduce((sum, player) => sum + player.sigma ** 2, 0);
	const muAvg = muSum / team.length;
	const sigmaAvg = math.sqrt(sigmaSum) / team.length;
	return { mu: muAvg, sigma: sigmaAvg };
}

// Calculate match outcome (win probability for each team)
function calculateMatchOutcome(players, teamA, teamB) {
	const ratingA = calculateTeamRating(players, teamA);
	const ratingB = calculateTeamRating(players, teamB);
	const deltaMu = ratingA.mu - ratingB.mu;
	const deltaSigma = math.sqrt(ratingA.sigma ** 2 + ratingB.sigma ** 2);
	const winProbability = 0.5 * (1 + math.erf(deltaMu / (deltaSigma * math.sqrt(2))));
	return { winProbability, teamARating: ratingA, teamBRating: ratingB };
}

// Update player ratings after a match
function updatePlayerRatings(players, teamA, teamB, outcome) {
	const { winProbability, teamARating, teamBRating } = calculateMatchOutcome(players, teamA, teamB);
	const kFactor = 2; // You can adjust this based on your game's dynamics

	// Update player ratings using TrueSkill formula
	teamA.forEach(player => {
		const playerRating = players[player];
		const v = 1 / (1 + (teamBRating.sigma / teamARating.sigma) ** 2);
		const delta = kFactor * v * (outcome - winProbability);
		playerRating.mu += delta;
		playerRating.sigma = math.sqrt((1 - v) * playerRating.sigma ** 2);
	});

	teamB.forEach(player => {
		const playerRating = players[player];
		const v = 1 / (1 + (teamARating.sigma / teamBRating.sigma) ** 2);
		const delta = kFactor * v * (1 - outcome - winProbability); // Note the (1 - outcome)
		playerRating.mu += delta;
		playerRating.sigma = Math.sqrt((1 - v) * playerRating.sigma ** 2);
	});

	return players;
	// Repeat the same process for teamB

	// Save updated ratings to your database
}

function getSkillRating(player) {
	return ((player.mu * 20) + 100).toFixed(2);
}

// Example usage
const team1 = ['Alice', 'Bob'];
const team2 = ['Charlie', 'David'];
const outcome = 1; // 1 for team1 win, 0.5 for draw, 0 for team2 win

for (let i = 0; i < 2; i++) {


	let p = updatePlayerRatings({
		'Alice': { mu: DEFAULT_MU + 1, sigma: DEFAULT_SIGMA },
		'Bob': { mu: DEFAULT_MU, sigma: DEFAULT_SIGMA },

		'Charlie': { mu: DEFAULT_MU + 5, sigma: DEFAULT_SIGMA },
		'David': { mu: DEFAULT_MU + 4, sigma: DEFAULT_SIGMA },
		// Add more players...
	}, team1, team2, /*Math.floor(Math.random() * 2)*/1);
	for (let key of Object.keys(p)) {
		const player = p[key];
		console.log({ ...player, SkillRating: getSkillRating(player) });
	}
}
