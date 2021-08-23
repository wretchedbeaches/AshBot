import masterfile from '../util/masterfile.json';
import util from '../util/util.json';
import config from '../config.json';
import { Router } from 'express';
const inside = require('point-in-polygon');
import client from '../Bot';
import {
  parsePokemon,
  parseRaid,
  parseQuest,
  parseInvasion,
  parseShinyPokemon,
} from '../util/parse';
import { getPreciseDistance } from 'geolib';
import { pokestop } from '../rdmdbModels/pokestop';
import https from 'https';

const boosted = {
  'partly cloudy': ['Normal', 'Rock'],
  cloudy: ['Fairy', 'Fighting', 'Poison'],
  fog: ['Dark', 'Ghost'],
  rain: ['Water', 'Electric', 'Bug'],
  snow: ['Ice', 'Steel'],
  sunny: ['Grass', 'Ground', 'Fire'],
  clear: ['Grass', 'Ground', 'Fire'],
  windy: ['Dragon', 'Flying', 'Psychic'],
};
const router = Router();

router.post('', async (req: any, res) => {
  console.log(`[Bot] Recieved ${req.body.length} Events`);
  for (let event of req.body) {
    let noData = false;
    switch (event.type) {
      case 'pokemon':
        let pokemonEmbed;
        for (let [guildId, { channels }] of client.settings.items) {
          for (let channelId in channels) {
            const channelConfig = channels[channelId];
            if (channelConfig.type !== 'pokemon') continue;
            const {
              cp,
              pokemon_level,
              individual_attack,
              individual_defense,
              individual_stamina,
              pokemon_id,
              latitude,
              longitude,
              weather,
              shiny,
              username,
              capture_1,
            } = event.message;
            const pokemonData = masterfile.pokemon['' + pokemon_id];
            if (!pokemonData || capture_1 === 0 || cp === undefined) {
              noData = true;
              break;
            }
            const isBoosted =
              weather !== 0 &&
              pokemonData.types.some((type) =>
                boosted[util.weather['' + weather].name].includes(type)
              );
            let iv: number;
            if (individual_attack && individual_defense && individual_stamina)
              iv =
                ((individual_attack + individual_defense + individual_stamina) /
                  45) *
                100;
            if (
              // filtering based on boosted
              (channelConfig.boosted !== undefined
                ? isBoosted === channelConfig.boosted
                : true) &&
              // filtering based on cp
              (channelConfig.mincp !== undefined
                ? (cp === 0 || cp) && cp >= channelConfig.mincp
                : true) &&
              (channelConfig.maxcp !== undefined
                ? (cp === 0 || cp) && cp <= channelConfig.maxcp
                : true) &&
              // filtering based on level
              (channelConfig.minlevel !== undefined
                ? (pokemon_level === 0 || pokemon_level) &&
                  pokemon_level >= channelConfig.minlevel
                : true) &&
              (channelConfig.maxlevel !== undefined
                ? (pokemon_level === 0 || pokemon_level) &&
                  pokemon_level <= channelConfig.maxlevel
                : true) &&
              // filtering based on iv
              (channelConfig.miniv !== undefined
                ? (iv === 0 || iv) && iv >= channelConfig.miniv
                : true) &&
              (channelConfig.maxiv !== undefined
                ? (iv === 0 || iv) && iv <= channelConfig.maxiv
                : true) &&
              // filtering based on raw iv
              (channelConfig.rawiv !== undefined
                ? individual_attack === channelConfig.rawiv.attack &&
                  individual_defense === channelConfig.rawiv.defense &&
                  individual_stamina === channelConfig.rawiv.stamina
                : true) &&
              // filtering based on name
              (channelConfig.name !== undefined
                ? channelConfig.name.includes(pokemonData.name.toLowerCase())
                : true) &&
              // filtering based on geofilter
              (channelConfig.geofilter !== undefined
                ? channelConfig.geofilter.center
                  ? getPreciseDistance(
                      { latitude: latitude,longitude: longitude },
                      {
                        latitude: channelConfig.geofilter.center[0],
                        longitude: channelConfig.geofilter.center[1],
                      }
                    ) < channelConfig.radius
                  : inside(
                      [latitude,longitude],
                      config.cities[channelConfig.geofilter]
                    )
                : true) &&
              // filtering based on train
              (channelConfig.train === true
                ? client.trains[channelId]
                  ? getPreciseDistance(
                      { latitude: latitude,longitude: longitude },
                      {
                        latitude: client.trains[channelId].latitude,
                        longitude: client.trains[channelId].longitude,
                      }
                    ) < parseInt(process.env.TRAIN_DISTANCE)
                  : true
                : true) &&
              // filtering based on shiny
              (channelConfig.shiny
                ? shiny &&
                  username !== 'PogoDroid' &&
                  config.shinyMentions[username] &&
                  config.shinyMentions[username].length === 21
                : true)
            ) {
              let distanceFromPrevious;
              if (client.trains[channelId] && channelConfig.train)
                distanceFromPrevious = getPreciseDistance(
                  { latitude: latitude, longitude: longitude },
                  {
                    latitude: client.trains[channelId].latitude,
                    longitude: client.trains[channelId].longitude,
                  }
                );
              client.trains[channelId] = {
                latitude: latitude,
                longitude: longitude,
              };
              if (!pokemonEmbed)
                pokemonEmbed = shiny
                  ? parseShinyPokemon(event.message, guildId)
                  : parsePokemon(
                      event.message,
                      guildId,
                      true,
                      distanceFromPrevious
                    );
              client.embedQueue[channelId].push(pokemonEmbed);
            }
          }
          if (noData) break;
        }
        break;
      case 'raid':
        let raidEmbed;
        for (let [guildId, { channels }] of client.settings.items) {
          for (let channelId in channels) {
            const channelConfig = channels[channelId];
            if (channelConfig.type !== 'raid') continue;
            const {
              cp,
              pokemon_id,
              latitude,
              longitude,
              team_id,
              level,
              ex_raid_eligible,
            } = event.message;
            const pokemonData = masterfile.pokemon['' + pokemon_id];
            if (!pokemonData) {
              noData = true;
              break;
            }
            if (
              // filtering based on ex eligibity
              (channelConfig.ex !== undefined
                ? ex_raid_eligible === channelConfig.ex
                : true) &&
              // filtering based on team
              (channelConfig.team !== undefined
                ? util.teams['' + team_id].name.toLowerCase() ===
                  channelConfig.team
                : true) &&
              // filtering based on cp
              (channelConfig.mincp !== undefined
                ? (cp === 0 || cp) && cp >= channelConfig.mincp
                : true) &&
              (channelConfig.maxcp !== undefined
                ? (cp === 0 || cp) && cp <= channelConfig.maxcp
                : true) &&
              // filtering based on level
              (channelConfig.minlevel !== undefined
                ? (level === 0 || level) && level >= channelConfig.minlevel
                : true) &&
              (channelConfig.maxlevel !== undefined
                ? (level === 0 || level) && level <= channelConfig.maxlevel
                : true) &&
              // filtering based on name
              (channelConfig.name !== undefined
                ? channelConfig.name.includes(pokemonData.name.toLowerCase())
                : true) &&
              // filtering based on geofilter
              (channelConfig.geofilter !== undefined
                ? channelConfig.geofilter.center
                  ? getPreciseDistance(
                      { latitude: latitude,longitude: longitude },
                      {
                        latitude: channelConfig.geofilter.center[0],
                        longitude: channelConfig.geofilter.center[1],
                      }
                    ) < channelConfig.radius
                  : inside(
                      [latitude,longitude],
                      config.cities[channelConfig.geofilter]
                    )
                : true) &&
              // filtering based on train
              (channelConfig.train === true
                ? client.trains[channelId]
                  ? getPreciseDistance(
                      { latitude: latitude,longitude: longitude },
                      {
                        latitude: client.trains[channelId].latitude,
                        longitude: client.trains[channelId].longitude,
                      }
                    ) < parseInt(process.env.TRAIN_DISTANCE)
                  : true
                : true)
            ) {
              let distanceFromPrevious;
              if (client.trains[channelId] && channelConfig.train)
                distanceFromPrevious = getPreciseDistance(
                  { latitude: latitude,longitude: longitude },
                  {
                    latitude: client.trains[channelId].latitude,
                    longitude: client.trains[channelId].longitude,
                  }
                );
              client.trains[channelId] = {
                latitude: latitude,
                longitude: longitude,
              };
              if (!raidEmbed)
                raidEmbed = parseRaid(
                  event.message,
                  guildId,
                  true,
                  distanceFromPrevious
                );
              client.embedQueue[channelId].push(raidEmbed);
            }
          }
          if (noData) break;
        }
        break;
      case 'quest':
        let questEmbed;
        const { rewards, pokestop_id } = event.message;
        // fs.appendFileSync('data/quest.json', JSON.stringify(event.message));
        const _latitude = event.message.latitude;
        const _longitude = event.message.longitude;
        const dbPokestop = await pokestop.findByPk(pokestop_id);
        for (let [guildId, { channels }] of client.settings.items)
          for (let channelId in channels) {
            const channelConfig = channels[channelId];
            if (channelConfig.type !== 'quest') continue;
            if (
              // filtering based on quest reward type
              (channelConfig.rewardType !== undefined
                ? masterfile.quest_reward_types[rewards[0].type] &&
                  masterfile.quest_reward_types[
                    rewards[0].type
                  ].text.toLowerCase() === channelConfig.rewardType
                : true) &&
              // filtering based on geofilter
              (channelConfig.geofilter !== undefined
                ? channelConfig.geofilter.center
                  ? getPreciseDistance(
                      { latitude: _latitude,longitude: _longitude },
                      {
                        latitude: channelConfig.geofilter.center[0],
                        longitude: channelConfig.geofilter.center[1],
                      }
                    ) < channelConfig.radius
                  : inside(
                      [_latitude,_longitude],
                      config.cities[channelConfig.geofilter]
                    )
                : true)
            ) {
              if (!questEmbed)
                questEmbed = parseQuest(
                  event.message,
                  guildId,
                  true,
                  dbPokestop.incident_expire_timestamp
                );
              client.embedQueue[channelId].push(questEmbed);
            }
          }
        break;
      case 'invasion':
        let invasionEmbed;
        const { latitude, longitude, grunt_type } = event.message;
        for (let [guildId, { channels }] of client.settings.items)
          for (let channelId in channels) {
            const channelConfig = channels[channelId];
            if (channelConfig.type !== 'invasion') continue;
            if (
              // filtering based on leader
              (channelConfig.leader !== undefined
                ? (grunt_type >= 40 && grunt_type <= 44) ===
                  channelConfig.leader
                : true) &&
              // filtering based on geofilter
              (channelConfig.geofilter !== undefined
                ? channelConfig.geofilter.center
                  ? getPreciseDistance(
                      { latitude: latitude,longitude: longitude },
                      {
                        latitude: channelConfig.geofilter.center[0],
                        longitude: channelConfig.geofilter.center[1],
                      }
                    ) < channelConfig.radius
                  : inside(
                      [latitude, longitude],
                      config.cities[channelConfig.geofilter]
                    )
                : true) &&
              // filtering based on train
              (channelConfig.train === true
                ? client.trains[channelId]
                  ? getPreciseDistance(
                      { latitude: latitude, longitude: longitude },
                      {
                        latitude: client.trains[channelId].latitude,
                        longitude: client.trains[channelId].longitude,
                      }
                    ) < parseInt(process.env.TRAIN_DISTANCE)
                  : true
                : true)
            ) {
              if (!invasionEmbed)
                invasionEmbed = parseInvasion(event.message, guildId, true);
              client.embedQueue[channelId].push(invasionEmbed);
            }
          }
        break;
    }
  }
  res.status(200).json({ message: 'SUCCESS' });
});

export default router;
