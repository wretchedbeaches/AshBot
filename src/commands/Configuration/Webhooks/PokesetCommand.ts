import { stripIndents } from 'common-tags';
import { CommandInteraction } from 'discord.js';
import { PokesetConfig } from '../../../models/WebhookConfigurations';
import BaseWebhooksetCommand from './BaseWebhooksetCommand';
import ntim from '../../../util/name_to_id_map.json';
import { addCommonFilterOptions, getNumberChoices } from '../../../util/WebhookFilterOptions';

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
		this.argumentConfigBlacklist.add('names');
		this.argumentConfigBlacklist.add('rmpokemon');
		this.argumentConfigBlacklist.add('atkiv');
		this.argumentConfigBlacklist.add('defiv');
		this.argumentConfigBlacklist.add('staiv');

		addCommonFilterOptions(this.data);
		const ivChoices = getNumberChoices(0, 15);
		this.data
			.addStringOption((rmpokemonOption) =>
				rmpokemonOption.setName('rmpokemon').setDescription('Pokemon to remove from the filter, update must be true.'),
			)
			.addStringOption((namesOption) =>
				namesOption.setName('names').setDescription('Comma separated Pokemon names to filter on.'),
			)
			.addIntegerOption((atkivOption) =>
				atkivOption.setName('atkiv').setDescription('The atk IV to filter on').addChoices(ivChoices),
			)
			.addIntegerOption((defivOption) =>
				defivOption.setName('defiv').setDescription('The def IV to filter on').addChoices(ivChoices),
			)
			.addIntegerOption((staivOption) =>
				staivOption.setName('staiv').setDescription('The sta IV to filter on').addChoices(ivChoices),
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

		const rawAtk = interaction.options.getInteger('atkiv', false);
		const rawDef = interaction.options.getInteger('defiv', false);
		const rawSta = interaction.options.getInteger('staiv', false);
		// TODO: Filter should be updated such that can filter on just one or 2 of them.
		// Not necessarily filter on all 3.

		if (rawAtk && rawDef && rawSta) {
			const rawIvError = `\n\nFailed to parse the atkiv/defiv/staiv filter that was provided: '${rawAtk}/${rawDef}/${rawSta}' - not applied.\nThe rawiv must be 'atk/def/sta' or 'atk,def,sta' format with each number between 0 and 15.`;
			if (this.validateIv(rawAtk) && this.validateIv(rawDef) && this.validateIv(rawSta)) {
				channelConfiguration.rawiv = { attack: rawAtk, defense: rawDef, stamina: rawSta };
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
