const { getProducts, getUserByID } = require("../../../mysql");
const { Product } = require("../Products/GetPlayerProducts");

module.exports = {
	run: async (ws, request, session) => {
		const playerID = request.Params.PlayerID;

		let m;

		if (Matches.length) {
			m = Matches[Matches.length - 1];
			await m.addSpecPayer(playerID);
		} else {
			m = new Match(playerID);
			await m.addSpecPayer(playerID);
			Matches.push(m);
		}
		if (playerID) {
			return {
				"MatchData": {
					id: m.id,
					teams: m.teams,
					sendTime: Date.now()
				}
			}
		}
	}
}


Matches = [];


const DEFAULT_MATCH_TIME = 5 * 60 * 1000;

class Match {
	constructor(creatorID) {
		this.id = Matches.length;
		this.teams = [
			{ name: "Blue", players: [], score: 0, },
			{ name: "Orange", players: [], score: 0, },
			{ name: "Spectator", players: [], score: 0, },
		];
		this.startedAt = null;
		this.createdAt = Date.now();
		this.createdBy = creatorID;
		this.completeAt = null;
		this.paused = false;
		this.ready = false;
		this.timer = new MatchTimer(DEFAULT_MATCH_TIME);
		this.remaining = this.timer.elapsed();
		if (this.teams !== undefined) {
			this.interval = setInterval(() => this.TickUpdate(), 8.33);

		}
	}

	PlayerLeft(id) {
		console.log(`Player left: ${id}`)
		for (let i = 0; i < this.teams.length; i++) {
			const team = this.teams[i];
			for (const player of team.players) {
				let eID = player.PlayerID.split("|")[1];
				if (eID === id) {
					this.teams[i].players = this.teams[i].players.filter((p) => !p.PlayerID.includes(id));
				}
			}
		}
	}

	TickUpdate() {

		const players = ([this.teams[0], this.teams[1]].map(t => t.players.map((t => t.PlayerID.split('Vibe|')[1]))).flat(Infinity));

		if (players.length > 0 && !this.ready) {
			this.ready = true;
			setTimeout(() => {
				this.broadcast("3");
				setTimeout(() => {
					this.broadcast("2");
					setTimeout(() => {
						this.broadcast("1");
						setTimeout(() => {
							this.broadcast("GO!");
							let startAt = Date.now();

							this.startedAt = startAt

							this.timer.start(startAt);
							console.log('Match timer has started');
						}, 1000);
					}, 1000);

				}, 1000);
			}, 1000);

		}
		const elapsed = (this.timer.elapsed());

		const date = new Date(DEFAULT_MATCH_TIME - elapsed);

		const d = new Date(Date.UTC(0, 0, 0, 0, 0, 0, date)),
			parts = [
				String(d.getUTCMinutes()),
				String(d.getUTCSeconds()).padStart(2, '0')

			],
			formatted = parts;


		let LobbyMembers = this.teams.map(p => p.players).flat(Infinity);
		for (const member of LobbyMembers) {
			let c = clients.get(this.parseVibeID(member.PlayerID));

			let mdata = this;

			let responses = [];

			let serv = {
				"MatchData": {
					id: mdata.id,
					teams: mdata.teams,
					sendTime: Date.now(),
					remainingTime: {
						minutes: formatted[0],
						seconds: formatted[1],
						ms: DEFAULT_MATCH_TIME - elapsed,
						matchLength: DEFAULT_MATCH_TIME
					},
					paused: this.paused
				}
			}

			responses.push({
				Service: "Matches/GameTick",
				Data: serv
			});

			c.ws.send(JSON.stringify(responses))

		}

	}


	async checkAdmin(id) {
		let user = getUserByID({ PlayerID: this.parseVibeID(id) });
		return (!!user.Admin)
	}

	addTime(ms) {
		this.timer.addTime(ms);
	}

	broadcast(message) {
		let LobbyMembers = this.teams.map(p => p.players).flat(Infinity);

		let responses = [];

		let serv = {
			"Broadcast": {
				Message: message,
				Timestamp: Date.now() + 1000

			}
		}

		responses.push({
			Service: "Matches/Broadcast",
			Data: serv
		});

		for (const member of LobbyMembers) {
			let c = clients.get(this.parseVibeID(member.PlayerID));
			c.ws.send(JSON.stringify(responses))
		}
	}

	pause(vibeID) {
		this.timer.pause();
		this.paused = true;

		let responses = [];

		let LobbyMembers = this.teams.map(p => p.players).flat(Infinity);
		let u = LobbyMembers.find((u) => u.PlayerID === vibeID)?.PlayerName;

		let serv = {
			"Broadcast": {
				Message: `${u} paused the game`,
				Timestamp: Date.now() + 2000

			}
		}

		responses.push({
			Service: "Matches/Broadcast",
			Data: serv
		});

		for (const member of LobbyMembers) {
			let c = clients.get(this.parseVibeID(member.PlayerID));
			c.ws.send(JSON.stringify(responses))
		}




	}

	unpause(vibeID) {
		this.timer.resume();
		this.paused = false;

		let LobbyMembers = this.teams.map(p => p.players).flat(Infinity);
		let u = LobbyMembers.find((u) => u.PlayerID === vibeID)?.PlayerName;

		let responses = [];

		let serv = {
			"Broadcast": {
				Message: `${u} unpaused the game`,
				Timestamp: Date.now() + 2000
			}
		}

		responses.push({
			Service: "Matches/Broadcast",
			Data: serv
		});

		for (const member of LobbyMembers) {
			let c = clients.get(this.parseVibeID(member.PlayerID));
			c.ws.send(JSON.stringify(responses))
		}

	}

	SetTeam(id, teamId) {
		console.log(`Player Switched to ${teamId}: ${id}`)
		for (let i = 0; i < this.teams.length; i++) {
			const team = this.teams[i];
			for (const player of team.players) {
				if (player.PlayerID === id) {
					this.teams[i].players = this.teams[i].players.filter((p) => !p.PlayerID.includes(id));
					this.teams[teamId].players.push(player);

				}
			}
		};

	}

	parseVibeID(id) {
		return id.split("|")[1]
	}

	stopMatch() {
		clearInterval(this.interval);
	}

	async addBluePlayer(vibeID) {
		let vID = this.parseVibeID(vibeID);

		const { products, titles } = await getProducts({ PlayerID: vID });
		console.log(products);


		this.teams[0].players.push({ PlayerID: vibeID, stats: {}, loadout })
	}

	async addOrangePlayer(vibeID) {
		let vID = this.parseVibeID(vibeID);

		this.teams[1].players.push({ PlayerID: vibeID, stats: {}, loadout })
	}

	async getData(vibeID) {

		let vID = this.parseVibeID(vibeID);

		const { products, titles } = await getProducts({ PlayerID: vID });
		let cP = cleanProducts(products, titles);
		let activeTitle = (cP.find((p) => p.Title !== undefined && p.Active));

		const res = (await getUserByID({ PlayerID: vID }))[0]
		return { activeTitle, PlayerName: res.PlayerName || "None" }
	}

	async addSpecPayer(vibeID) {

		let { activeTitle, PlayerName } = await this.getData(vibeID);

		this.teams[2].players.push({
			PlayerID: vibeID, PlayerName: PlayerName, stats: {}, loadout: {
				title: activeTitle
			}
		})
	}
}

function cleanProducts(products, titles) {
	return productsCleaned = products.map((p) => {
		const attributes = p.attributes;
		let attr = {};

		attributes.split('|').forEach(a => {
			let array = (a.split(':'))
			for (let i = 0; i < array.length; i += 2) {
				const key = array[i];
				const value = array[i + 1];
				attr[key] = value;
			}
		});
		if (attr.titleId) {
			let t = titles.find((t) => t.title_Id === attr.titleId);
			p = {
				...p,
				...t,
				attributes: attr
			}
		}
		return new Product(p).toJSON();
	});
}

class MatchTimer {
	constructor(matchDuration) {
		this.startTime = null;
		this.pausedTime = 0;
		this.isRunning = false;
		this.matchDuration = matchDuration;
	}

	start(startTime) {
		this.startTime = startTime;
		this.isRunning = true;
		console.log("Timer started.");
	}

	pause() {
		if (this.isRunning) {
			this.pausedTime = Date.now() - this.startTime;
			this.isRunning = false;
			console.log("Timer paused.");
		}
	}

	resume() {
		if (!this.isRunning) {
			this.startTime = Date.now() - this.pausedTime;
			this.pausedTime = 0;
			this.isRunning = true;
			console.log("Timer resumed.");
		}
	}

	elapsed() {
		if (this.isRunning) {
			return Math.min(Date.now() - this.startTime, this.matchDuration);
		} else {
			return Math.min(this.pausedTime, this.matchDuration);
		}
	}

	isOver() {
		return this.elapsed() >= this.matchDuration;
	}

	addTime(milliseconds) {
		if (this.isRunning) {
			// this.startTime -= milliseconds; // Subtract the time to simulate adding time
			this.startTime += milliseconds
		} else {
			this.startTime -= milliseconds; // Subtract the time to simulate adding time
		}


		console.log(`Added ${milliseconds / 1000} seconds to the timer.`);
	}
}