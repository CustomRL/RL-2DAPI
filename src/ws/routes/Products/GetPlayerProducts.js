const { getProducts } = require("../../../mysql");

module.exports = {
	run: async (ws, request) => {
		const playerID = request.Params.PlayerID.split('Vibe|')[1];
		const { products, titles } = await getProducts({ PlayerID: playerID });

		let productsCleaned = products.map((p) => {
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

		if (playerID) {
			return {
				"ProductData": [
					...productsCleaned
				]
			}
		}
	}
}


class Product {
	constructor(data) {
		this.ProductID = data.productID;
		this.InstanceID = data.id;
		this.Attributes = data.attributes;
		this.SlotID = data.product_slot_id;
		this.AddedTimestamp = data.addedTimestamp;
		this.Active = !!data.active;
		this.TradeHold = data.tradehold;

		this.Product = {
			Label: data.product_label,
			LongLabel: data.product_longLabel,
			AssetPath: data.product_assetPath,
		};

		if (data.title_Id) {
			this.Title = {
				ID: data.title_Id,
				Text: data.title_text,
				Color: data.title_color,
				Glow: data.title_glow,
				Category: data.title_category
			}
		}
	}

	toJSON() {
		return this;
	}
}

module.exports.Product = Product;
