import { CommandInteraction, HexColorString, MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import ntim from '../../util/name_to_id_map.json';
import { pokestop } from '../../rdmdbModels/pokestop';
import sequelize, { Op } from 'sequelize';
import { parseQuestDb } from '../../util/parse';
import { Literal, Where } from 'sequelize/types/lib/utils';
import { ButtonPaginator } from '@psibean/discord.js-pagination';
import BaseSearchCommand from './BaseSearchCommand';
import config from '../../config.json';
import { itemsData, pokemonData, pokemonTypesData } from '../../data/Data';
import { Item, PokemonData } from '../../data/DataTypes';

interface HandleData {
	title: string;
	thumbnail: string;
	color?: HexColorString;
}

export default class QuestSearchCommand extends BaseSearchCommand {
	public constructor() {
		super('quest', {
			description: {
				content: 'Search for quests by reward type.',
				usage: stripIndents`quest pokemon \`pokemon name\` \`distance latitude longitude\` \`city\`

        **OR**
        quest item "\`item name\`" \`distance latitude longitude\` \`city\`

        **OR**
        quest stardust \`stardust amount\` \`distance latitude longitude\` \`city\`,

        **OR**
        quest mega pokemon \`pokemon name\` \`distance latitude longitude\` \`city\``,
				examples: [
					'quest item "sun stone" plymouth',
					'quest pokemon pikachu 10km 35.482501,139.631672',
					'quest stardust 1200',
					'quest mega beedrill',
				],
			},
		});

		this.data.addSubcommand((pokemonSubcommand) => {
			pokemonSubcommand
				.setName('pokemon')
				.setDescription('Search for quest by Pokemon reward type')
				.addStringOption((nameOption) =>
					nameOption.setName('name').setDescription('The name of the pokemon to search by').setRequired(true),
				);
			QuestSearchCommand.addCommonOptions(pokemonSubcommand);
			return pokemonSubcommand;
		});
		this.data.addSubcommand((itemSubcommand) => {
			itemSubcommand
				.setName('item')
				.setDescription('Search quest by item reward type')
				.addStringOption((nameOption) =>
					nameOption.setName('name').setDescription('The name of the item to search by'),
				);
			QuestSearchCommand.addCommonOptions(itemSubcommand);
			return itemSubcommand;
		});
		this.data.addSubcommand((stardustSubcommand) => {
			stardustSubcommand
				.setName('stardust')
				.setDescription('Search quest by stardust reward type')
				.addIntegerOption((amountOption) => amountOption.setName('amount').setDescription('The amount of stardust'));
			QuestSearchCommand.addCommonOptions(stardustSubcommand);
			return stardustSubcommand;
		});
		this.data.addSubcommand((megaSubcommand) => {
			megaSubcommand
				.setName('mega')
				.setDescription('Search quest by mega energy reward type')
				.addIntegerOption((nameOption) =>
					nameOption.setName('name').setDescription('The name of the Pokemon mega energy'),
				);
			QuestSearchCommand.addCommonOptions(megaSubcommand);
			return megaSubcommand;
		});
	}

	public async execute(interaction: CommandInteraction) {
		const { subcommand, center, radius, city } = this.parseCommonArgs(interaction);
		if (city !== null)
			if (config.cities[city] === undefined)
				return interaction.editReply(`The provided city '${city}' does not seem to be valid.`);

		const withinCityQuery: Literal | null = BaseSearchCommand.getWithinCityQuery('pokestop', city);

		const distanceQuery: Literal | null = BaseSearchCommand.getDistanceQuery('pokestop', center);

		const dbQuestsAnd: (Where | Literal | Record<string, unknown>)[] = [];
		if (center !== null && distanceQuery !== null)
			dbQuestsAnd.push(
				sequelize.where(distanceQuery, {
					[Op.lte]: radius,
				}),
			);
		else if (withinCityQuery !== null) dbQuestsAnd.push(withinCityQuery);

		let nameArgument = '';
		let pokemonId: string | undefined = '';
		let pokemon: PokemonData | undefined;
		let item: Item | undefined;
		let title: string | undefined;
		let color: HexColorString | undefined;
		let thumbnail: string | undefined;
		if (subcommand === 'pookemon' || subcommand === 'mega') {
			nameArgument = interaction.options.getString('name', true);
			pokemonId = ntim[nameArgument.toLowerCase()];
			pokemon = pokemonData[pokemonId ?? ''];
			if (pokemonId === undefined || pokemon === undefined)
				return interaction.editReply(`THe provided pokemon name '${nameArgument}' could not be resolved to a pokemon`);
		}

		if (subcommand === 'item') {
			nameArgument = interaction.options.getString('name', true);
			item = itemsData[nameArgument.toLowerCase()];
			if (item === undefined)
				return interaction.editReply(`Could not find an item by the provided name '${nameArgument}'`);
		}

		switch (subcommand) {
			case 'pokemon':
				({ title, color, thumbnail } = this.handlePokemon(nameArgument, pokemon!, dbQuestsAnd));
				break;
			case 'item':
				({ title, color, thumbnail } = this.handleItem(item!, dbQuestsAnd));
				break;
			case 'stardust':
				({ title, color, thumbnail } = this.handleStardust(interaction, dbQuestsAnd));
				break;
			case 'mega':
				({ title, color, thumbnail } = this.handleMega(pokemon!, dbQuestsAnd));
				break;
		}

		const dbQuests = await pokestop.findAll({
			...(center !== null && distanceQuery !== null && { order: distanceQuery }),
			where: {
				[Op.and]: dbQuestsAnd,
			},
			limit: parseInt(process.env.SEARCH_LIMIT!, 10),
		});

		if (!title) title = `Unable to resolve title`;

		const questCount = dbQuests.length;
		const fieldLength = parseInt(process.env.FIELDS_LENGTH ?? '6', 10);
		const maxPages = questCount / fieldLength + (questCount % fieldLength > 0 ? 1 : 0);
		const pages: MessageEmbed[] = [];
		for (let i = 0; i < maxPages; i++) {
			const embed = this.client.embed(interaction.guildId);
			const sliceStart = i * fieldLength;
			const sliceEnd = sliceStart + fieldLength > questCount ? questCount : sliceStart + fieldLength;
			embed.setTitle(title);
			if (thumbnail) embed.setThumbnail(thumbnail);
			if (color) embed.setColor(color);
			embed.setDescription(
				`**Quests**\n${dbQuests
					.slice(sliceStart, sliceEnd)
					.map((pokestopValue) => parseQuestDb(pokestopValue))
					.join()
					.trim()}`,
			);
			pages.push(embed);
		}

		const messageOptionsResolver = ({ newIdentifiers, paginator }: { newIdentifiers; paginator: ButtonPaginator }) => {
			return {
				content: `Page ${(newIdentifiers.pageIdentifier as number) + 1}/${paginator.maxNumberOfPages as number}`,
			};
		};

		const buttonPaginator = new ButtonPaginator(interaction, {
			pages,
			messageOptionsResolver,
			maxNumberOfPages: pages.length,
		});

		return buttonPaginator.send();
	}

	public handleStardust(interaction: CommandInteraction, dbQuestsAnd): HandleData {
		const amount = interaction.options.getInteger('amount', true);

		dbQuestsAnd.push({
			quest_reward_type: 3,
			quest_rewards: { [Op.like]: `%"amount":${amount}%` },
		});

		return {
			title: `Qiuests With StardustAmount ${amount}`,
			thumbnail: `https://i.imgur.com/WimkNLf.png`,
		};
	}

	public handlePokemon(pokemonName: string, pokemon: PokemonData, dbQuestsAnd): HandleData {
		dbQuestsAnd.push({
			quest_reward_type: 7,
			quest_pokemon_id: pokemon.pokedexId,
		});

		const pokemonTypeData = pokemonTypesData[pokemon.types[0]];
		const typeColor = pokemonTypeData?.color;

		return {
			title: `Quests For Pokemon ${pokemonName.charAt(0).toUpperCase()}${pokemonName.substring(1).toLowerCase()}`,
			color: typeColor,
			thumbnail: `https://play.pokemonshowdown.com/sprites/xyani/${pokemonName.toLowerCase()}.gif`,
		};
	}

	public handleItem(item: Item, dbQuestsAnd): HandleData {
		dbQuestsAnd.push({
			quest_reward_type: 2,
			quest_item_id: item.id,
		});
		return {
			title: `Quest With Reward ${item.name}`,
			thumbnail: `https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/rewards/reward_${item.id}_1.png`,
		};
	}

	public handleMega(pokemon: PokemonData, dbQuestsAnd): HandleData {
		dbQuestsAnd.push({
			quest_reward_type: 12,
			quest_rewards: { [Op.like]: `%"pokemon_id":${pokemon.pokedexId}%` },
		});
		const typeColor = pokemonTypesData[pokemon.types[0] ?? '']?.color;
		return {
			title: `Mega Energy Quests For ${pokemon.name}`,
			color: typeColor,
			thumbnail: `https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/rewards/reward_mega_energy_${pokemon.pokedexId}.png`,
		};
	}
}
