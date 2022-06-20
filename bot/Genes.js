export class Genes {
	constructor(features = {}) {
		this.features = features;
	}

	mutate(lr = 10) {
		let mutated = new Genes({ ...this.features });
		for (let key of Object.keys(this.features))
			if (Math.random() < .1)
				mutated.features[key] += (Math.random() - .5) * lr * 2;
		return (mutated);
	}

	breath(genes_pool) {
		let breathed = new Genes();
		let mate = genes_pool[Math.floor(Math.random() * genes_pool.length)];
		for (let key of Object.keys(this.features))
		{
			if (Math.random() < .4)
				breathed.features[key] = mate.genes.features[key];
			else
				breathed.features[key] = this.features[key];
		}
		return (breathed);
	}

	/** @param {string} feature */
	/** @param {number} val */
	/** @param {number} hint hint value */
	get(feature, val, hint) {
		return val * (this.features[feature] ??= Math.random() * hint);
	}
}