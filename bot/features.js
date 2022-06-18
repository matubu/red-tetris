export class Genes {
	constructor(features = {}) {
		this.features = features;
	}

	mutate(lr = .05) {
		let mutated = new Genes();
		for (let key of Object.keys(this.features))
			mutated.features[key] =
				this.features[key]
					+ (Math.random() - .5) * lr;
		return (mutated);
	}

	breath(genes_pool) {
		let breathed = new Genes();
		for (let key of Object.keys(this.features))
		{
			let fac = Math.random();
			let mate = genes_pool[Math.floor(Math.random() * genes_pool.length)];

			breathed.features[key] =
				this.features[key] * fac
				+ mate.features[key] * (1-fac)
		}
		return (breathed)
	}

	get(feature, positive = 1) {
		return (this.features[feature] ??= Math.random() * positive);
	}
}