import { CommandInteraction, HexColorString, MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import config from '../../config.json';
import ntim from '../../util/name_to_id_map.json';
import masterfile from '../../util/masterfile.json';
import { pokestop } from '../../rdmdbModels/pokestop';
import sequelize, { Op } from 'sequelize';
import util from '../../util/util.json';
import { parseQuestDb } from '../../util/parse';
import Command from '../../struct/commands/Command';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { Literal, Where } from 'sequelize/types/lib/utils';
import { PokemonItemDataType, PokemonTypeDataType } from '../../models/Data';
import { ButtonPaginator } from '@psibean/discord.js-pagination';

interface HandleData {
	title: string;
	thumbnail: string;
	color?: HexColorString;
}

export default class QuestSearchCommand extends Command {
	public static addCommonOptions(commandBuilder: SlashCommandBuilder | SlashCommandSubcommandBuilder) {
		commandBuilder
			.addIntegerOption((distanceOption) =>
				distanceOption.setName('distance').setDescription('The radius to search, defaults to km (see unit)'),
			)
			.addStringOption((unitOption) =>
				unitOption.setName('unit').setDescription('The metric of the distance, metres or kilometres'),
			)
			.addStringOption((cityOption) => cityOption.setName('city').setDescription('The city to search within'))
			.addNumberOption((latitudeOption) =>
				latitudeOption.setName('latitude').setDescription('The latitude to search from'),
			)
			.addNumberOption((longitudeOption) =>
				longitudeOption.setName('longitude').setDescription('The longitude to search from'),
			);
	}

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
			category: 'Search',
			rateLimit: 3,
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
		const subcommand = interaction.options.getSubcommand(true);
		const latitude = interaction.options.getNumber('latitude', false);
		const longitude = interaction.options.getNumber('longitude', false);
		// Default to 10km if not provided
		const distance = interaction.options.getInteger('distance', false) ?? 10;
		const unit = interaction.options.getString('unit', false) ?? 'km';
		const radius = unit === 'km' ? distance : distance / 1000;
		const city = interaction.options.getString('city');

		let center: { lat: number; long: number } | null = null;
		if (latitude !== null && longitude !== null) center = { lat: latitude, long: longitude };
		let withinCity: Literal | null = null;
		if (city !== null)
			withinCity = sequelize.literal(`ST_CONTAINS(ST_GEOMFROMTEXT(
      'POLYGON((${
				config.cities[city].map((coord: [number, number]) => `${coord[1]} ${coord[0]}`).join(', ') as string
			}))'), POINT(\`pokestop\`.\`lon\`, \`pokestop\`.\`lat\`))`);

		let distanceQuery: Literal | null = null;
		if (center !== null) {
			distanceQuery = sequelize.literal(
				`111.111 *
		DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${center.lat}))
				 * COS(RADIANS(\`pokestop\`.\`lat\`))
				 * COS(RADIANS(${center.long} - \`pokestop\`.\`lon\`))
				 + SIN(RADIANS(${center.lat}))
				 * SIN(RADIANS(\`pokestop\`.\`lat\`)))))`,
			);
		}

		const dbQuestsAnd: (Where | Literal | Record<string, unknown>)[] = [];
		if (center !== null && distanceQuery !== null)
			dbQuestsAnd.push(
				sequelize.where(distanceQuery, {
					[Op.lte]: radius,
				}),
			);

		if (withinCity !== null) dbQuestsAnd.push(withinCity);

		let nameArgument = '';
		let pokemonId: string | undefined = '';
		let item: PokemonItemDataType | undefined;
		let title: string | undefined;
		let color: HexColorString | undefined;
		let thumbnail: string | undefined;
		if (subcommand === 'pookemon' || subcommand === 'mega') {
			nameArgument = interaction.options.getString('name', true);
			pokemonId = ntim[nameArgument.toLowerCase()];
			if (!pokemonId)
				return interaction.editReply(`THe provided pokemon name '${nameArgument}' could not be resolved to a pokemon`);
		}

		if (subcommand === 'item') {
			nameArgument = interaction.options.getString('name', true);
			for (const itemId in masterfile.items) {
				if (masterfile.items.hasOwnProperty(itemId)) {
					if (masterfile.items[itemId] && masterfile.items[itemId].name === nameArgument)
						item = {
							...masterfile.items[itemId],
							id: itemId,
						};
					break;
				}
			}
			if (!item) return interaction.editReply(`Could not find an item by the provided name '${nameArgument}'`);
		}

		switch (subcommand) {
			case 'pokemon':
				({ title, color, thumbnail } = this.handlePokemon(nameArgument, pokemonId, dbQuestsAnd));
				break;
			case 'item':
				({ title, color, thumbnail } = this.handleItem(item!, dbQuestsAnd));
				break;
			case 'stardust':
				await this.handleStardust(interaction, dbQuestsAnd);
				break;
			case 'mega':
				await this.handleMega(pokemonId, nameArgument.toLowerCase()!, dbQuestsAnd);
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

		const messageOptionsResolver = ({
			newIdentifier,
			paginator,
		}: {
			newIdentifier: number;
			paginator: ButtonPaginator;
		}) => {
			return {
				content: `Page ${newIdentifier + 1}/${paginator.maxNumberOfPages as number}`,
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

	public handlePokemon(pokemonId: string, pokemonName: string, dbQuestsAnd): HandleData {
		dbQuestsAnd.push({
			quest_reward_type: 7,
			quest_pokemon_id: pokemonId,
		});

		const pokemonDataTypes = Object.values(masterfile.pokemon[pokemonId]!.types) as unknown as PokemonTypeDataType[];

		return {
			title: `Quests For Pokemon ${pokemonName.charAt(0).toUpperCase()}${pokemonName.substring(1).toLowerCase()}`,
			color: `#${util.types[pokemonDataTypes[0].typeName].color.toString(16) as string}` as HexColorString,
			thumbnail: `https://play.pokemonshowdown.com/sprites/xyani/${pokemonName.toLowerCase()}.gif`,
		};
	}

	public handleItem(item: PokemonItemDataType, dbQuestsAnd): HandleData {
		dbQuestsAnd.push({
			quest_reward_type: 2,
			quest_item_id: item.id!,
		});
		return {
			title: `Quest With Reward ${item.name}`,
			thumbnail: `https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/rewards/reward_${item.id!}_1.png`,
		};
	}

	public handleMega(pokemonId: string, pokemonName: string, dbQuestsAnd): HandleData {
		dbQuestsAnd.push({
			quest_reward_type: 12,
			quest_rewards: { [Op.like]: `%"pokemon_id":${pokemonId}%` },
		});

		const pokemonDataTypes = Object.values(masterfile.pokemon[pokemonId]!.types) as unknown as PokemonTypeDataType[];
		return {
			title: `Mega Energy Quests For ${pokemonName.charAt(0).toUpperCase()}${pokemonName.substring(1).toLowerCase()}`,
			color: `#${util.types[pokemonDataTypes[0].typeName].color.toString(16) as string}` as HexColorString,
			thumbnail: `https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/rewards/reward_mega_energy_${pokemonId}.png`,
		};
	}
}
