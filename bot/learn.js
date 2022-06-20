import { Bot } from "./Bot.js";
import { Genes } from "./Genes.js";
import fs from "fs";

const COUNT = 100;
const PART = COUNT / 4;

let bots = new Array(COUNT)
	.fill()
	.map((_, i) => new Bot(`matubu-${i}`))

if (fs.existsSync('data.json'))
{
	console.log('loading data.json ...');
	let genes = JSON.parse(fs.readFileSync('data.json'));
	for (let i in genes)
		bots[i]?.setGenes?.(new Genes(genes[i]));
}

// TODO better selection
// TODO test on multiple games

let iter = 0;
while (1)
{
	let start = performance.now();
	console.log('starting new iteration', ++iter, '...');
	
	let results = await Promise.all(bots.map(bot => bot.start_bot(`botroom-${iter}`, COUNT, iter)))
	for (let i = 0; i < 2; ++i)
	{
		let refinement = (await Promise.all(bots.map(bot => bot.start_bot(`botroom-${iter}-${i}`, COUNT, iter))));
		for (let i in refinement)
		{
			results[i].score += refinement[i].score;
			results[i].i += refinement[i].i;
			results[i].tetrisCount += refinement[i].tetrisCount;
		}
	}

	let bests = results
		.sort((a, b) =>
			(b.score + b.tetrisCount * 10_000 - b.i * 100)
			- (a.score + a.tetrisCount * 10_000 - a.i * 100)
		);
	let bests_selection = bests.slice(0, PART * 2);

	let best_score = results.sort((a, b) => b.score - a.score)

	console.log('----------- Results -----------')
	console.log('best:', bests[0].score, bests[0].tetrisCount, 'by', bests[0].botname);
	console.log('best score:', best_score[0].score, best_score[0].tetrisCount, 'by', best_score[0].botname);
	console.log('avg score:', results.reduce((a, bot) => a + bot.score, 0) / results.length);
	console.log('worst score:', best_score.at(-1).score, best_score.at(-1).tetrisCount, 'by', best_score.at(-1).botname);
	console.log('-------------------------------')
	console.log('breathing bots ...');

	for (let i = 0; i < PART; ++i)
	{
		bots[i].setGenes(bests[i].genes);
		bots[i + PART].setGenes(bests[i].genes.mutate());
		bots[i + 2 * PART].setGenes(bests[i].genes.breath(bests_selection));
		bots[i + 3 * PART].setGenes(bests[i].genes.breath(bests_selection).mutate());
	}

	console.log('saving json data ...');

	fs.writeFileSync('data.json', JSON.stringify(bests.map(res => res.genes.features)));

	console.log('iteration', iter, 'took', (performance.now() - start) / 1000 / 60, 'minutes');
}