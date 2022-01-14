import { CommandInteraction, MessageEmbed } from 'discord.js';
import ntim from '../../util/name_to_id_map.json';
import { nests } from '../../manualdbModels/nests';
import { parseNestDb } from '../../util/parse';
import { ButtonPaginator } from '@psibean/discord.js-pagination';
import { pokemonData, pokemonTypesData } from '../../data/Data';
import COMMAND_NAMES from '../../util/CommandNames';
import BaseChannelRestrictedCommand from '../BaseChannelRestrictedCommand';

export default class NestSearchCommand extends BaseChannelRestrictedCommand {
	public constructor() {
		super(COMMAND_NAMES.SEARCH.NEST, {
			description: {
				content: 'Search for nests by pokemon name.',
				usage: 'nestsearch `pokemon name`',
				examples: ['nestsearch pikachu'],
			},
			category: 'Search',
			rateLimit: 3,
		});
	}

	public async execute(interaction: CommandInteraction) {
		const nameArgument = interaction.options.getString('name', true);
		const pokemonId = ntim[nameArgument.toLowerCase()];
		if (!pokemonId) return interaction.editReply(`The name '${nameArgument}' could not be resolved to a Pokemon`);
		const dbNests = await nests.findAll({
			where: {
				pokemon_id: pokemonId,
			},
		});

		if (dbNests.length > 0) {
			// creating and sending paginated embed with results
			const nestCount = dbNests.length;
			const fieldLength = parseInt(process.env.FIELDS_LENGTH ?? '6', 10);
			const maxPages = nestCount / fieldLength + (nestCount % fieldLength > 0 ? 1 : 0);
			const pages: MessageEmbed[] = [];
			const messageOptionsResolver = ({
				newIdentifiers,
				paginator,
			}: {
				newIdentifiers;
				paginator: ButtonPaginator;
			}) => {
				return {
					content: `Page ${(newIdentifiers.pageIdentifier as number) + 1}/${paginator.maxNumberOfPages as number}`,
				};
			};
			for (let i = 0; i < maxPages; i++) {
				const embed = this.client.embed(interaction.guildId);
				const sliceStart = i * fieldLength;
				const sliceEnd = sliceStart + fieldLength > nestCount ? nestCount : sliceStart + fieldLength;
				embed.setTitle(
					`${nameArgument.charAt(0).toUpperCase()}${nameArgument.substring(1)} ${
						this.client.nestMigrationDate
							? `Nests (Next Migration: ${this.client.nestMigrationDate.toLocaleDateString()})`
							: ''
					}`,
				);
				embed.setThumbnail(`https://play.pokemonshowdown.com/sprites/xyani/${nameArgument.toLowerCase()}.gif`);
				const pokemonType = pokemonTypesData[pokemonData[pokemonId]!.types[0]];
				embed.setColor(pokemonType!.color);
				embed.setDescription(
					`**Nests**\n${dbNests
						.slice(sliceStart, sliceEnd)
						.map((pokestopValue) => parseNestDb(pokestopValue))
						.join()
						.trim()}`,
				);
				pages.push(embed);
			}
			const buttonPaginator = new ButtonPaginator(interaction, {
				pages,
				maxNumberOfPages: maxPages,
				messageOptionsResolver,
			});
			return buttonPaginator.send();
		}
	}
}
