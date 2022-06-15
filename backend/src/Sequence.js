import { TETRIMINOS } from "./Piece.js";

export class Sequence {
	constructor(length = 32) {
		this.sequence = [];

		for (let i = 0; i < length; ++i) {
			let tetriminos = [0, 1, 2, 3, 4, 5, 6];
			let currentIndex = tetriminos.length, randomIndex;
	
			// While there remain elements to shuffle.
			while (currentIndex != 0) {
	
				// Pick a remaining element.
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex--;
	
				// Swap two element with the random index
				[tetriminos[currentIndex], tetriminos[randomIndex]] = [tetriminos[randomIndex], tetriminos[currentIndex]];
			}
			this.sequence.push(...tetriminos);
		}
	}
	get(i) {
		return (TETRIMINOS[this.sequence[i % this.sequence.length]]);
	}
}