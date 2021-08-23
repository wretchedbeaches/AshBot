import { Message } from 'discord.js';
import masterfile from '../util/masterfile.json';
import config from '../config.json';

export const rmchannel = {
  id: 'rmchannel',
  flag: ['rmchannel'],
  match: 'flag',
};

export const train = {
  id: 'train',
  flag: ['train'],
  match: 'flag',
};

export const boosted = {
  id: 'boosted',
  flag: ['boosted'],
  match: 'option',
};

export const name = {
  id: 'name',
  type: (_: Message, str: string): null | string[] => {
    const names = str.split(',').map((name) => name.toLowerCase());
    if (
      names.every((name) =>
        Object.values(masterfile.pokemon).some(
          (pokemon) => pokemon.name === name
        )
      )
    )
      return names;
    return null;
  },
  flag: ['name'],
  prompt: {
    optional: true,
    start: (msg: Message) =>
      `${msg.author}, please provide a valid pokemon name, or set of names separated by commas. **Example: name pikachu,electabuzz**.`,
    retry: (msg: Message) =>
      `${msg.author}, please provide a valid pokemon name, or set of names separated by commas. **Example: name pikachu,electabuzz**.`,
  },
  match: 'option',
};

export const geofilter = {
  id: 'geofilter',
  type: (_: Message, str: string): null | Object => {
    try {
      if (Object.keys(config.cities).includes(str.toLowerCase()))
        return { city: str };
      const parts = str.split(' ');
      const unit = parts[0].endsWith('km')
        ? 'km'
        : parts[0].endsWith('m')
        ? 'm'
        : null;
      if (unit === null) return null;
      return {
        center: [
          Number(parts[1].split(',')[0]),
          Number(parts[1].split(',')[1]),
        ],
        radius:
          unit === 'km'
            ? Number(parts[0].substring(0, parts[0].indexOf('km')))
            : Number(parts[0].substring(0, parts[0].indexOf('m'))),
        unit: unit,
      };
    } catch (e) {
      return null;
    }
  },
  flag: ['geofilter'],
  prompt: {
    optional: true,
    start: (msg: Message) =>
      `${msg.author}, please provide a valid geofilter format.  \`distance\`\`km or m\` \`lattitude\`,\`longitude\` or a city. **Example: geofilter "10km 50.393057,-4.112226"**`,
    retry: (msg: Message) =>
      `${msg.author}, please provide a valid geofilter format.  \`distance\`\`km or m\` \`lattitude\`,\`longitude\` or a city. **Example: geofilter "10km 50.393057,-4.112226"**`,
  },
  match: 'option',
};

export const miniv = {
  id: 'miniv',
  type: (_: Message, str: string): null | number => {
    const miniv = parseInt(str);
    if (isNaN(miniv)) return null;
    if (miniv < 0 || miniv > 100) return null;
    else return miniv;
  },
  flag: ['miniv'],
  prompt: {
    optional: true,
    start: (msg: Message) =>
      `${msg.author}, please provide a number between 0 and 100. **Example: miniv 50**`,
    retry: (msg: Message) =>
      `${msg.author}, please provide a number between 0 and 100. **Example: miniv 50**`,
  },

  match: 'option',
};
