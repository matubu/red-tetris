import { Bot } from "./Bot.js";
import fs from "fs";

const COUNT = 90;
const PART = COUNT / 3;

let bots = new Array(COUNT)
	.fill()
	.map((_, i) => new Bot(`matubu-${i}`))

let i = 0;

// TODO better selection
// TODO auto join and train

// if (fs.existsSync('data.json'))
// {
// 	console.log('loading data.json')
// 	let genes = JSON.parse(fs.readFileSync('data.json'))
// 	for (let i in genes)
// 		bots[i]?.setGenes?.(new Genes(genes[i]));
// }

while (1)
{
	console.log('iteration', ++i);

	let results = (await Promise.all(bots.map(bot => bot.start_bot())))
		.sort((a, b) =>
			(a.i - a.score / 500)
			- (b.i - b.score / 500)
		);

	let bests = results.slice(0, PART);

	for (let i = 0; i < PART; ++i)
	{
		bots[i].setGenes(results[i].genes);
		bots[i + PART].setGenes(results[i].genes.mutate());
		bots[i + 2 * PART].setGenes(results[i].genes.breath(bests));
	}

	fs.writeFileSync('data.json', JSON.stringify(results.map(res => res.genes.features)));
}