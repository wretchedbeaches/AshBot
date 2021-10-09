import { stripIndents } from 'common-tags';
import { CommandInteraction } from 'discord.js';
import { PokesetConfig } from '../../../models/WebhookConfigurations';
import BaseWebhooksetCommand from './BaseWebhooksetCommand';
import ntim from '../../../util/name_to_id_map.json';

// Eventually the discord API will allow for native support of min/max number values.
// But in the mean time will need to do it on the client:
// TODO: Need to put min/max level and cp validations in

export default class PokesetCommand extends BaseWebhooksetCommand {
	public constructor() {
		super('pokeset', {
			webhookType: 'pokemon',
			description: {
				content: 'Set or remove the pokemon webhook configuration for a particular channel.',
				usage: stripIndents`pokeset
        boosted \`true|false\`
        name \`pokemon's name / list of pokemon names separated by ','\`
        geofilter \`distance(km/m) lattitude,longitude|city\`
        miniv \`min iv\`
        maxiv \`max iv\`
        mincp \`min cp\`
        maxcp \`max cp\`
        minlevel \`min level\`
        maxlevel \`max level\`
        rawiv \`attack\`,\`defense\`,\`stamina\`
        train

        **OR**

        pokeset update=true rmpokemon \`name1,name2,name3,...\``,
				examples: [
					'pokeset boosted true geofilter 10km 50.393057,-4.112226 miniv 10 maxiv 100 mincp 1000 maxcp 4000 minlevel 1 maxlevel 2 rawiv 15/15/15 pikachu,electabuzz',
					'pokeset rmchannel',
					'pokeset update=true rmpokemon=pikachu,electabuzz',
				],
			},
		});
		this.argumentConfigBlacklist.add('name');
		this.argumentConfigBlacklist.add('rmpokemon');
		this.argumentConfigBlacklist.add('rawiv');
		this.data.addStringOption((rmpokemonOption) =>
			rmpokemonOption.setName('rmpokemon').setDescription('Pokemon to remove from the filter, update must be true.'),
		);
	}

	public handleArguments({
		interaction,
		channelConfiguration,
		isUpdate,
	}: {
		interaction: CommandInteraction;
		channelConfiguration: PokesetConfig;
		isUpdate: boolean;
	}) {
		if (isUpdate && channelConfiguration.name) {
			const rmpokemon = interaction.options.getString('name', false);
			if (rmpokemon) {
				const removePokemonSplit = rmpokemon.toLowerCase().split(',');
				const existingPokemonNames = channelConfiguration.name;
				if (Array.isArray(existingPokemonNames)) {
					channelConfiguration.name = existingPokemonNames.filter((name) => !removePokemonSplit.includes(name));
				} else if (removePokemonSplit.includes(channelConfiguration.name as string)) {
					delete channelConfiguration.name;
				}
			}
		}

		const nameArgument = interaction.options.getString('name', false);
		let error = '';
		if (nameArgument) {
			const namesToSet: string[] = [];
			const splitName = nameArgument.toLowerCase().split(',');
			for (const pokemonName of splitName) {
				if (ntim[pokemonName]) namesToSet.push(pokemonName);
				else error += `${pokemonName} `;
			}
			if (error) {
				error = error.trim().split(' ').join(', ');
				error = `\n\nThe following pokemon names were provided but could not be found:\n${error}\nAny others were successfully applied.`;
			}
			if (namesToSet.length > 0) {
				channelConfiguration.name = namesToSet;
			}
		}

		const rawivArgument = interaction.options.getString('rawiv', false);
		// TODO: Raw iv argument should be 3 individual number arghuments
		// Filter should be updated such that can filter on just one or 2 of them.
		// Not necessarily filter on all 3.
		if (rawivArgument) {
			let splitRawiv: string[] = [];
			const rawIvError = `\n\nFailed to parse the atk/def/sta rawiv filter that was provided: '${rawivArgument}'' - not applied.\nThe rawiv must be 'atk/def/sta' or 'atk,def,sta' format with each number between 0 and 15.`;
			if (rawivArgument.includes(',')) splitRawiv = rawivArgument.split(',');
			else if (rawivArgument.includes('/')) splitRawiv = rawivArgument.split('/');
			if (splitRawiv.length === 3) {
				splitRawiv = rawivArgument.split(',');
				try {
					const attack = parseInt(splitRawiv[0], 10);
					const defense = parseInt(splitRawiv[1], 10);
					const stamina = parseInt(splitRawiv[2], 10);
					if (this.validateIv(attack) && this.validateIv(defense) && this.validateIv(stamina)) {
						channelConfiguration.rawiv = { attack, defense, stamina };
					} else {
						error += rawIvError;
					}
				} catch (e) {
					error += rawIvError;
				}
			} else {
				error += rawIvError;
			}
		}

		return error.trim();
	}

	private validateIv(iv: number) {
		return iv > 0 && iv < 15;
	}
}
