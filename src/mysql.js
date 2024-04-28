const mysql = require('mysql');

const Pool = mysql.createPool({
	host: "localhost",
	user: "root",
	password: "",
	port: "3306",
	database: "rocketleague",
	connectionLimit: "10",
	encoding: 'utf8',
	charset: 'utf8mb4',
	multipleStatements: true
})

async function query(sql, ...options) {
	return new Promise(function (resolve, reject) {
		Pool.getConnection(function (poolerr, connection) {
			if (poolerr) {
				reject(Error(poolerr));
			} else {
				connection.query(sql, options, function (err, rows) {
					if (err) {
						console.log(err)
						reject(Error(err));
					}
					resolve(rows);
					connection.release();
				});
			}
		});
	});
}

module.exports.findAuthUser = async ({ PlayerID, Ticket }) => {
	return await query(`SELECT * FROM players WHERE PlayerID = ? AND Ticket = ? LIMIT 1`, PlayerID, Ticket);
}

module.exports.setActiveTitle = async ({ PlayerID, InstanceID }) => {
	return await query(`UPDATE onlineproducts SET ACTIVE = FALSE WHERE productID = 1 AND PlayerID = ?; UPDATE onlineproducts SET ACTIVE = TRUE WHERE id = ?`, PlayerID, InstanceID)
}

module.exports.createUser = async ({ PlayerID, Token, PlayerName }) => {
	return await query(`INSERT INTO players (PlayerID, PlayerName, Ticket, Admin) VALUES (?, ?, ?, ?)`, PlayerID, PlayerName, Token, false)
}

module.exports.addSession = async ({ PlayerID, SessionID, expiresAt }) => {
	return await query(`INSERT INTO sessions (PlayerID, SessionID, expiresAt) VALUES (?, ?, ?)`, PlayerID, SessionID, expiresAt)
}

module.exports.getSession = async ({ PlayerID, SessionID }) => {
	return await query("SELECT * FROM sessions WHERE SessionID = ? AND PlayerID = ?", SessionID, PlayerID)
}

module.exports.getUserByID = async ({ PlayerID }) => {
	return await query("SELECT * FROM players WHERE PlayerID = ?", PlayerID);
}

module.exports.getProducts = async ({ PlayerID }) => {
	if (cache.length === 0) cache = await updateTitleCache();
	let products = await query(`SELECT op.*, p.label AS product_label, p.longLabel AS product_longLabel, p.assetPath AS product_assetPath, p.tradeable AS product_tradeable, p.paintable AS product_paintable, p.certifiable AS product_certifiable, p.slot_id AS product_slot_id
	FROM onlineproducts AS op
	JOIN products AS p ON op.productID = p.id
	WHERE op.PlayerID = ?;`, PlayerID);

	return { products, titles: cache }

}

let cache = [];

module.exports.getTitleDatabase = () => {
	return cache;
}

function init() {
	setTimeout(async () => {
		const tables = [

			`CREATE TABLE IF NOT EXISTS players(
			id INT AUTO_INCREMENT PRIMARY KEY,
			PlayerID VARCHAR(255),
			PlayerName VARCHAR(255),
			Ticket VARCHAR(255)
		);`,

			`CREATE TABLE IF NOT EXISTS sessions(
			id INT AUTO_INCREMENT PRIMARY KEY,
			PlayerID VARCHAR(255),
			SessionID VARCHAR(255),
			expiresAt BIGINT
		);`


		]
		let m = await query(tables.join('\n'));
		// console.log(m);
	}, 5000)

	setInterval(async () => {
		cache = await updateTitleCache();
	}, 10000);
}

async function updateTitleCache() {
	return await query(`SELECT
    t.color as 'title_color',
    t.glow as 'title_glow',
    tc.id as 'title_Id',
    tc.text as 'title_text',
    tc.category as 'title_category'
FROM
    titlecategories AS t
LEFT JOIN
    titles AS tc ON t.categoryName = tc.category;`)
}

init();