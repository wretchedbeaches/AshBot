import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import ntim from '../../util/name_to_id_map.json';
import { nests } from '../../manualdbModels/nests';
import { parseNestDb } from '../../util/parse';
import { FieldsEmbed } from 'discord-paginationembed';
import util from '../../util/util.json';
import masterfile from '../../util/masterfile.json';

export default class NestsearchCommand extends Command {
  public constructor() {
    super('nestsearch', {
      aliases: ['nestsearch'],
      category: 'Search',
      description: {
        content: 'Search for nests by pokemon name.',
        usage: 'nestsearch `pokemon name`',
        examples: ['nestsearch pikachu'],
      },
      ratelimit: 3,
      args: [
        {
          id: 'name',
          type: (_: Message, str: string): null | string => {
            if (Object.keys(ntim).includes(str.toLowerCase()))
              return str.toLowerCase();
            return null;
          },
          prompt: {
            optional: false,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid pokemon name.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid pokemon name.`,
          },
          match: 'rest',
        },
      ],
    });
  }

  public async exec(message: Message, args) {
    const pokemon_id = ntim[args.name.toLowerCase()];
    const dbNests = await nests.findAll({
      where: {
        pokemon_id: pokemon_id,
      },
    });
    // sending confirmation message
    const confirmation = `Found ${dbNests.length} ${args.name} Nests`;
    message.channel.send(confirmation);
    if (dbNests.length > 0) {
      // creating and sending paginated embed with results
      let fields = dbNests.map((pokemon) => parseNestDb(pokemon));
      const embed = new FieldsEmbed();
      embed.embed = this.client
        .embed(message.guild.id)
        .setTitle(
          `${args.name.charAt(0).toUpperCase()}${args.name.substring(1)} ` +
            (this.client.nestMigrationDate
              ? `Nests (Next Migration: ${this.client.nestMigrationDate.toLocaleDateString()})`
              : '')
        )
        .setColor(
          `#${util.types[
            masterfile.pokemon['' + pokemon_id].types[0]
          ].color.toString(16)}`
        )
        .setThumbnail(
          `https://play.pokemonshowdown.com/sprites/xyani/${args.name.toLowerCase()}.gif`
        );
      embed
        .setArray(fields.length > 0 ? fields : [{ value: 'No nests found.' }])
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel as TextChannel)
        .setPageIndicator(true)
        .setElementsPerPage(parseInt(process.env.FIELDS_LENGTH))
        .formatField('Nests', (el) => (el as any).value)
        .setTimeout(300000)
        .build();
    }
  }
}
