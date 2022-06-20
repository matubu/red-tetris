import { Bot } from "./Bot.js";
import { Genes } from "./Genes.js";
import fs from "fs";

let bot = new Bot(`matubu-bot`)

bot?.setGenes?.(new Genes(JSON.parse(fs.readFileSync('data.json'))[0]))

bot.start_bot(`duel`, 2, 0)