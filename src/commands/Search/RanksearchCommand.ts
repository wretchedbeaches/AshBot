import { CommandInteraction, MessageEmbed } from 'discord.js';
import Command from '../../struct/commands/Command';
import { RankingDataType } from '../../models/Data';
import { RankingDataCollection } from '../../util/RankingDataManager';

type LeagueIdentifier = 1500 | 2500 | 10000;
type LeagueName = 'great' | 'ultra' | 'master';

type LeagueMap = {
	[key in LeagueIdentifier]: LeagueName;
};
export default class RankSearchCommand extends Command {
	public static LeagueMap: LeagueMap = {
		1500: 'great',
		2500: 'ultra',
		10000: 'master',
	};

	public constructor() {
		super('rank', {
			description: {
				content: 'Search for PVP ranks by league and pokemon.',
				usage: 'rank `pokemon name` `league name`',
				examples: ['rank espeon ultra', 'rank great'],
			},
			category: 'Search',
			rateLimit: 3,
		});

		this.data
			.addStringOption((pokemonNameOption) =>
				pokemonNameOption.setName('name').setDescription('The name of the pokemon to search by'),
			)
			.addIntegerOption((leagueOption) =>
				leagueOption
					.setName('league')
					.setDescription('The league to search by')
					.addChoices([
						['great', 1500],
						['ultra', 2500],
						['master', 10000],
					]),
			);
	}

	public execute(interaction: CommandInteraction) {
		const nameArgument = interaction.options.getString('name', false);
		let leagueArgument: LeagueIdentifier | null = interaction.options.getInteger(
			'league',
			false,
		) as LeagueIdentifier | null;
		if (nameArgument === null && leagueArgument === null) {
			return interaction.editReply(
				`Must specify either a name or league or both as search parameters. Example: **rank umbreon ultra**.`,
			);
		}
		let data: RankingDataType | null = null;
		const embed = new MessageEmbed();
		if (leagueArgument === null) leagueArgument = 1500;
		const leagueName: LeagueName = RankSearchCommand.LeagueMap[leagueArgument];
		console.log(`LEAGUE NAME: ${leagueName}`);
		const rankingData: RankingDataCollection = this.client.rankingData.leagueDataMap![leagueName];
		if (nameArgument === null) {
			// Search by rank only
			return interaction.editReply(`Command is WIP.`);
		} else if (rankingData.has(nameArgument.toLowerCase())) {
			data = rankingData.get(nameArgument.toLowerCase())!;
			embed.setTitle(`${data.rating} ${data.speciesName}`);
			embed.addField('Matchups', data.matchups.map((val) => `${val.opponent}: ${val.rating}`).join('\n'), true);
			embed.addField('Counters', data.counters.map((val) => `${val.opponent}: ${val.rating}`).join('\n'), true);
			return interaction.editReply({ embeds: [embed] });
		}
		return interaction.editReply(
			`Couldn't find a ranking for the Pokemon '${nameArgument}' in the '${leagueName}' league.`,
		);
	}
}

// export default class RanksearchCommand extends Command {
//   public constructor() {
//     super('rank', {
//       aliases: ['rank'],
//       category: 'Search',
//       description: {
//         content: 'Search for PVP ranks by league and pokemon.',
//         usage: 'rank `pokemon name` `league name`',
//         examples: ['rank espeon ultra', 'rank great'],
//       },
//       ratelimit: 3,
//       args: [
//         {
//           id: 'name',
//           type: (_: Message, str: string): boolean | string => {
//             if (Object.keys(ntim).includes(str.toLowerCase()))
//               return str.toLowerCase();
//             return false;
//           },
//           match: 'separate',
//         },
//         {
//           id: 'league',
//           type: (_: Message, str: string): boolean | Object => {
//             if (['ultra', 'great', 'master'].includes(str.toLowerCase()))
//               return {
//                 id: nameToIdMap[str.toLowerCase()],
//                 league: str.toLowerCase(),
//               };
//             return false;
//           },
//           match: 'separate',
//         },
//       ],
//     });
//   }

//   public async exec(message: Message, args): Promise<Message> {
//     for (let arg in args) {
//       if (args[arg] === null || args[arg] === false) delete args[arg];
//       if (['name', 'league'].includes(arg) && args[arg] && args[arg].length > 0)
//         args[arg] = args[arg].find((a) => a !== false && a !== null);
//     }
//     if (!args.name && !args.league)
//       return message.channel.send(
//         `Must specify either a name or league or both as search parameters. Example: **rank umbreon ultra**.`
//       );
//     if (args.name) {
//       if (!args.league) args.league = { id: '1500', league: 'great' };
//       try {
//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();
//         await page.goto(
//           `https://pvpoke.com/rankings/all/${args.league.id}/overall/${args.name}/`
//         );
//         await page.waitForFunction(
//           "$('.selected > .details > .detail-section.stats')[0] !== undefined",
//           {
//             timeout: 10000,
//           }
//         );
//         const evaluations = (await Promise.all([
//           //name: 0
//           page.evaluate(
//             "$('.selected > .name-container > .name')[0].innerText"
//           ),
//           //rank: 1
//           page.evaluate(
//             "$('.selected > .name-container > .number')[0].innerText"
//           ),
//           //key wins: 2
//           page.evaluate(
//             "Array.from($('.selected > .details > .detail-section > .matchups.clear')[0].children).map(el => el.children[0].innerText.substring(2))"
//           ),
//           //key losses: 3
//           page.evaluate(
//             "Array.from($('.selected > .details > .detail-section > .counters.clear')[0].children).map(el => el.children[0].innerText.substring(2))"
//           ),
//           //fast moves: 4
//           page.evaluate(
//             "Array.from($('.selected > .details > .detail-section > .moveset.fast')[0].children).map(el => el.children[0].innerText.substring(2))"
//           ),
//           //charge moves: Metal Claw5
//           page.evaluate(
//             "Array.from($('.selected > .details > .detail-section > .moveset.charged')[0].children).map(el => el.children[0].innerText.substring(2))"
//           ),
//           //ivs: 6
//           page.evaluate(
//             "Array.from($('.selected > .details > .detail-section.stats')[0].children).slice(0, 3).map(el => (parseFloat(el.children[1].innerText) + parseFloat(el.children[2].innerText)) / 2)"
//           ),
//         ])) as any[];
//         const counterInfo = (
//           await axios.get(
//             `https://db.pokemongohub.net/api/pokemon/counters-v2/${
//               ntim[args.name.toLowerCase()]
//             }?fastMove=0&chargeMove=0&orderBy=score&includeShadow=false&includeMega=true`
//           )
//         ).data;
//         const embed = this.client
//           .embed(message.guild.id)
//           .setTitle(`Rank ${evaluations[1]} ${evaluations[0]}`)
//           .setAuthor(message.author.username, message.author.avatarURL())
//           .setThumbnail(
//             `https://play.pokemonshowdown.com/sprites/xyani/${args.name.toLowerCase()}.gif`
//           )
//           .setDescription(
//             `**__Best Fast Moves__**\n${evaluations[4]
//               .map((fastMove) => {
//                 const move = Object.values(masterfile.moves).find(
//                   (move: any) =>
//                     move.type &&
//                     move.name.split(' ').join('').toLowerCase() ===
//                       fastMove.split(' ').join('').toLowerCase()
//                 ) as any;
//                 return (
//                   fastMove +
//                   ' ' +
//                   (move && move.type
//                     ? this.client.getEmoji(config.typeEmojis[move.type])
//                     : '')
//                 );
//               })
//               .join('\n')}\n\n` +
//               `**__Best Charged Moves__**\n${evaluations[5]
//                 .map((chargedMove) => {
//                   const move = Object.values(masterfile.moves).find(
//                     (move: any) =>
//                       move.type &&
//                       move.name.split(' ').join('').toLowerCase() ===
//                         chargedMove.split(' ').join('').toLowerCase()
//                   ) as any;
//                   return (
//                     chargedMove +
//                     ' ' +
//                     (move && move.type
//                       ? this.client.getEmoji(config.typeEmojis[move.type])
//                       : '')
//                   );
//                 })
//                 .join('\n')}\n\n` +
//               `**__Key Wins__**\n${evaluations[2]
//                 .map(
//                   (pokemon) =>
//                     this.client.getEmoji(
//                       'pokemon_' + ntim[pokemon.split(' ')[0].toLowerCase()]
//                     ) +
//                     ' ' +
//                     pokemon
//                 )
//                 .join('\n')}\n\n` +
//               `**__Key Losses__**\n${evaluations[3]
//                 .map(
//                   (pokemon) =>
//                     this.client.getEmoji(
//                       'pokemon_' + ntim[pokemon.split(' ')[0].toLowerCase()]
//                     ) +
//                     ' ' +
//                     pokemon
//                 )
//                 .join('\n')}\n\n` +
//               `**__Stats__**\n:crossed_swords: Attack: \`${evaluations[6][0]}\`\n:shield: Defense: \`${evaluations[6][1]}\`\n:arrow_right: Stamina: \`${evaluations[6][2]}\`\n\n`
//           );
//         await message.channel.send(embed);
//         let fieldsEmbed = new FieldsEmbed();
//         fieldsEmbed.embed = this.client
//           .embed(message.guild.id)
//           .setTitle(`Counters`);
//         fieldsEmbed
//           .setArray(counterInfo)
//           .setAuthorizedUsers([message.author.id])
//           .setChannel(message.channel as TextChannel)
//           .setPageIndicator(true)
//           .setElementsPerPage(parseInt(process.env.COUNTER_FIELDS_LENGTH))
//           .formatField(
//             'Counters',
//             (pokemon: any) =>
//               stripIndents`__${pokemon.pokemon.name}__
//           ${this.client.getEmoji(
//             config.typeEmojis[
//               pokemon.fast.type.charAt(0).toUpperCase() +
//                 pokemon.fast.type.substring(1)
//             ]
//           )} ${pokemon.fast.name}
//           ${this.client.getEmoji(
//             config.typeEmojis[
//               pokemon.charge.type.charAt(0).toUpperCase() +
//                 pokemon.charge.type.substring(1)
//             ]
//           )} ${pokemon.charge.name}`
//           )
//           .setTimeout(300000)
//           .build();
//         await browser.close();
//       } catch (e) {
//         console.log(e);
//         return message.channel.send(
//           this.client
//             .embed(message.guild.id)
//             .setTitle(`No rank information found for ${args.name}`)
//         );
//       }
//     } else {
//       let rankings: any = (
//         await axios.get(
//           `https://pvpoke.com/data/rankings/all/overall/rankings-${args.league.id}.json?v=1.20.7.12`
//         )
//       ).data;
//       rankings = rankings.map((ranking, index) => ({
//         index: index,
//         ranking: ranking,
//       }));
//       let fieldsEmbed = new FieldsEmbed();
//       fieldsEmbed.embed = this.client
//         .embed(message.guild.id)
//         .setTitle(
//           `Top ${args.league.league
//             .charAt(0)
//             .toUpperCase()}${args.league.league
//             .substring(1)
//             .toLowerCase()} League Pokemon`
//         );
//       fieldsEmbed
//         .setArray(rankings)
//         .setAuthorizedUsers([message.author.id])
//         .setChannel(message.channel as TextChannel)
//         .setPageIndicator(true)
//         .setElementsPerPage(parseInt(process.env.RANK_LEAGUE_FIELDS_LENGTH))
//         .formatField('Pokemon', (pokemon: any) => {
//           const fastMove1: any = Object.values(masterfile.moves).find(
//             (move: any) =>
//               move.type &&
//               move.name.toLowerCase() ===
//                 pokemon.ranking.moves.fastMoves[0].moveId
//                   .split('_')
//                   .join(' ')
//                   .toLowerCase()
//           );
//           const fastMove2: any = Object.values(masterfile.moves).find(
//             (move: any) =>
//               move.type &&
//               move.name.toLowerCase() ===
//                 pokemon.ranking.moves.fastMoves[1].moveId
//                   .split('_')
//                   .join(' ')
//                   .toLowerCase()
//           );
//           const chargedMove1: any = Object.values(masterfile.moves).find(
//             (move: any) =>
//               move.type &&
//               move.name.toLowerCase() ===
//                 pokemon.ranking.moves.chargedMoves[0].moveId
//                   .split('_')
//                   .join(' ')
//                   .toLowerCase()
//           );
//           const chargedMove2: any = Object.values(masterfile.moves).find(
//             (move: any) =>
//               move.type &&
//               move.name.toLowerCase() ===
//                 pokemon.ranking.moves.chargedMoves[1].moveId
//                   .split('_')
//                   .join(' ')
//                   .toLowerCase()
//           );
//           return (
//             stripIndents`**${pokemon.index + 1}: ${
//               pokemon.ranking.speciesName
//             }**
//             __Best Fast Moves:__
//           ${
//             fastMove1 && fastMove1.type
//               ? this.client.getEmoji(config.typeEmojis[fastMove1.type])
//               : ''
//           } ${fastMove1.name}
//           ${
//             fastMove2 && fastMove2.type
//               ? this.client.getEmoji(config.typeEmojis[fastMove1.type])
//               : ''
//           } ${fastMove2.name}
//           __Best Charged Moves:__
//           ${
//             chargedMove1 && chargedMove1.type
//               ? this.client.getEmoji(config.typeEmojis[chargedMove1.type])
//               : ''
//           } ${chargedMove1.name}
//           ${
//             chargedMove2 && chargedMove2.type
//               ? this.client.getEmoji(config.typeEmojis[chargedMove2.type])
//               : ''
//           } ${chargedMove2.name}` + '\n'
//           );
//         })
//         .setTimeout(300000)
//         .build();
//     }
//   }
// }
