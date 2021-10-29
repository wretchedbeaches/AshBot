import { CommandInteraction } from 'discord.js';
import cheerio from 'cheerio';
import axios from 'axios';
import Command from '../../struct/commands/Command';
import ntim from '../../util/name_to_id_map.json';

export default class NestListCommand extends Command {
	public constructor() {
		super('nest', {
			category: 'Utilities',
			description: {
				content: 'Retrieves a list of the current nesting pokemon.',
				usage: 'nest',
				examples: ['nest'],
			},
			isEphemeral: true,
		});
	}

	public async execute(interaction: CommandInteraction) {
		const typeArgument = interaction.options.getString('type', false) ?? 'global';
		const data = (await axios.get('https://themasternest.net/')).data;
		const $ = cheerio.load(data as string);
		const nestingPokemonHtml = $('#nesting-species').find('strong').html() ?? $('#nesting-species').html();
		if (nestingPokemonHtml === null)
			return interaction.editReply(`There was a problem fetching the current nesting pokemon.`);

		const breaklineSplit = nestingPokemonHtml
			.toLowerCase()
			.split('<br>')
			.filter((val) => val.replace('"', '').trim() !== '')
			.map((val) => val.trim());

		const nestPokemon = { world: [], north: [], south: [] };

		let currentNestType = 'world';
		for (const line of breaklineSplit) {
			if (line.includes('world')) currentNestType = 'world';
			else if (line.includes('north')) currentNestType = 'north';
			else if (line.includes('south')) currentNestType = 'south';
			else {
				const splitLine = line.split(',');
				for (const splitEntry of splitLine) {
					const pokemonName = splitEntry.trim();
					// Use logging just to get details on missing info to fix / add over time.
					if (ntim[pokemonName] === undefined)
						this.client.logger.warn(`Pokemon '${pokemonName}' is missing from name to id map.`, { command: this.id });
					const emojiName = `pokemon_${pokemonName}`;
					const pokemonEmoji = this.client.getEmoji(emojiName);
					if (pokemonEmoji === emojiName) {
						this.client.logger.warn(`Couldn't find '${emojiName}' emoji for ${pokemonName}.`, { command: this.id });
						nestPokemon[currentNestType].push(pokemonName);
					} else nestPokemon[currentNestType].push(`${pokemonEmoji.toString()} ${pokemonName}`);
				}
			}
		}
		let nestContent = '';
		// TODO: This content can probably be cached and periodically updated / swept.
		const worldwideContent = `**❯ Worldwide**\n\n${nestPokemon.world.sort().join(', ')}`;
		const northernContent = `**❯ Northern Hemisphere**\n\n${nestPokemon.north.sort().join(', ')}`;
		const southernContent = `**❯ Southern Hemisphere**\n\n${nestPokemon.south.sort().join(', ')}`;
		switch (typeArgument) {
			case 'global':
				nestContent = `${worldwideContent}\n\n${northernContent}\n\n${southernContent}`;
				break;
			case 'worldwide':
				nestContent = worldwideContent;
				break;
			case 'north':
				nestContent = northernContent;
				break;
			case 'south':
				nestContent = southernContent;
				break;
		}

		const embed = this.client.embed(interaction.guildId).setTitle('Nesting Pokemon').setDescription(nestContent);
		return interaction.editReply({ embeds: [embed] });
	}
}
