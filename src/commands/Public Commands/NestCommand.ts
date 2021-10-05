import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import cheerio from 'cheerio';
import axios from 'axios';
import { FieldsEmbed } from 'discord-paginationembed';
import masterfile from '../../util/masterfile.json';

export default class NestlistCommand extends Command {
  public constructor() {
    super('nest', {
      aliases: ['nest'],
      category: 'Utilies',
      description: {
        content: 'Retrieves a list of the current nesting pokemon.',
        usage: 'nest',
        examples: ['nest'],
      },
      args: [
        {
          id: 'type',
          type: (_: Message, str: string): null | string => {
            if (['list'].includes(str)) return str.toLowerCase();
            return null;
          },
          prompt: {
            optional: false,
            start: (msg: Message) =>
              `${msg.author}, please provide a valid utility type, currently only **list**.`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid utility type, currently only **list**.`,
          },
        },
      ],
      ratelimit: 3,
    });
  }

  public async exec(message: Message) {
    const data = (await axios.get('https://themasternest.net/')).data;
    const $ = cheerio.load(data);
    const nestingPokemon = $('#nesting-species')
      .children()
      .html()
      .split('<br>')
      .join(', ')
      .split(', ')
      .map((p) => p.trim())
      .map((p) => ({
        value: `${this.client.getEmoji(
          'pokemon_' +
            Object.entries(masterfile.pokemon).find(([k, v]) => v.name === p)[0]
        )} ${p}`,
      }));
    let embed = new FieldsEmbed();
    embed.embed = this.client
      .embed(message.guild.id)
      .setTitle(`Nesting Pokemon`);
    embed
      .setArray(
        nestingPokemon.length > 0
          ? nestingPokemon
          : [{ value: 'No nesting pokemon found.' }]
      )
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel as TextChannel)
      .setPageIndicator(true)
      .setElementsPerPage(parseInt(process.env.NEST_LIST_FIELDS_LENGTH))
      .formatField('Pokemon', (el) => (el as any).value)
      .setTimeout(300000)
      .build();
  }
}
