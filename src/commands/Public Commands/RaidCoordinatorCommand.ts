import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { stripIndents } from 'common-tags';
import ntim from '../../util/name_to_id_map.json';

export default class RaidsearchCommand extends Command {
  public constructor() {
    super('raid', {
      aliases: ['raid','r'],
      category: 'Public Commands',
      description: {
        content: 'Coordinate a raid.',
        usage: 'raid ``',
        examples: ['raid mewtwo 4'],
      },
      ratelimit: 3,
      args: [
        {
          id: 'name',
          type: (_: Message, str: string): void | string => {
            if (Object.keys(ntim).includes(str.toLowerCase()))
              return str.toLowerCase();
          },
          match: 'phrase',
        },
        {
          id: 'maxParticipants',
          type: 'integer',
          prompt: {
            start: (message: Message): string => `${message.author}, how many raid members do you want in your party?`,
            retry: (message: Message): string => `${message.author}, please enter a valid number.`
         },
        },
      ],
    });
  }

  public async exec(message: Message, args) {
    for (let arg in args) {
      if (args[arg] === null || args[arg] === false) delete args[arg];
      if (
        ['name', 'maxParticipants'].includes(arg) &&
        args[arg] &&
        args[arg].length > 0
      )
        args[arg] = args[arg].find((a) => a !== false && a !== null);
    }
    if (args.name) args.pokemon_id = ntim[args.name.toLowerCase()];
    if (args.radius) {
      args.unit = args.radius.unit;
      args.radius = args.radius.radius;
    }
    
    
    
    
    
    return message.util.send()
        
}
}
    

  

