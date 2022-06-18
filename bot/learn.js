import { Bot, Genes } from "./bot.js";
import fs from "fs";

const COUNT = 90

let bots = new Array(COUNT)
	.fill()
	.map((_, i) => new Bot(`matubu-${i}`))

let i = 0;

if (fs.existsSync('data.json'))
{
	console.log('loading data.json')
	let genes = JSON.parse(fs.readFileSync('data.json'))
	for (let i in genes)
		bots[i]?.setGenes?.(new Genes(genes[i]));
}

while (1)
{
	console.log('iteration', ++i);

	let results = (await Promise.all(bots.map(bot => bot.start_bot())))
		.sort((a, b) =>
			(a.i * 10 - a.score)
			- (b.i * 10 - b.score)
		);

	for (let i = 0; i < COUNT / 2; ++i)
		bots[i].setGenes(results[i].genes);
	for (let i = 0; i < COUNT / 2; ++i)
		bots[i + COUNT / 2].setGenes(results[i].genes.mutate());

	fs.writeFileSync('data.json', JSON.stringify(results.map(res => res.genes.features)));
}