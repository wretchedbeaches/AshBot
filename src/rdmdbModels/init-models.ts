/* eslint-disable no-duplicate-imports */
import type { Sequelize, Model } from 'sequelize';
import { account } from './account';
import type { accountAttributes, accountCreationAttributes } from './account';
import { assignment } from './assignment';
import type { assignmentAttributes, assignmentCreationAttributes } from './assignment';
import { communities } from './communities';
import type { communitiesAttributes, communitiesCreationAttributes } from './communities';
import { device } from './device';
import type { deviceAttributes, deviceCreationAttributes } from './device';
import { device_group } from './device_group';
import type { device_groupAttributes, device_groupCreationAttributes } from './device_group';
import { device_group_device } from './device_group_device';
import type { device_group_deviceAttributes, device_group_deviceCreationAttributes } from './device_group_device';
import { discord_rule } from './discord_rule';
import type { discord_ruleAttributes, discord_ruleCreationAttributes } from './discord_rule';
import { group } from './group';
import type { groupAttributes, groupCreationAttributes } from './group';
import { guild } from './guild';
import type { guildAttributes, guildCreationAttributes } from './guild';
import { gym } from './gym';
import type { gymAttributes, gymCreationAttributes } from './gym';
import { ingress_portals } from './ingress_portals';
import type { ingress_portalsAttributes, ingress_portalsCreationAttributes } from './ingress_portals';
import { instance } from './instance';
import type { instanceAttributes, instanceCreationAttributes } from './instance';
import { invasion_stats } from './invasion_stats';
import type { invasion_statsAttributes, invasion_statsCreationAttributes } from './invasion_stats';
import { metadata } from './metadata';
import type { metadataAttributes, metadataCreationAttributes } from './metadata';
import { nests } from './nests';
import type { nestsAttributes, nestsCreationAttributes } from './nests';
import { poi } from './poi';
import type { poiAttributes, poiCreationAttributes } from './poi';
import { pokemon } from './pokemon';
import type { pokemonAttributes, pokemonCreationAttributes } from './pokemon';
import { pokemon_iv_stats } from './pokemon_iv_stats';
import type { pokemon_iv_statsAttributes, pokemon_iv_statsCreationAttributes } from './pokemon_iv_stats';
import { pokemon_shiny_stats } from './pokemon_shiny_stats';
import type { pokemon_shiny_statsAttributes, pokemon_shiny_statsCreationAttributes } from './pokemon_shiny_stats';
import { pokemon_stats } from './pokemon_stats';
import type { pokemon_statsAttributes, pokemon_statsCreationAttributes } from './pokemon_stats';
import { pokestop } from './pokestop';
import type { pokestopAttributes, pokestopCreationAttributes } from './pokestop';
import { quest_stats } from './quest_stats';
import type { quest_statsAttributes, quest_statsCreationAttributes } from './quest_stats';
import { raid_stats } from './raid_stats';
import type { raid_statsAttributes, raid_statsCreationAttributes } from './raid_stats';
import { s2cell } from './s2cell';
import type { s2cellAttributes, s2cellCreationAttributes } from './s2cell';
import { sessions } from './sessions';
import type { sessionsAttributes, sessionsCreationAttributes } from './sessions';
import { spawnpoint } from './spawnpoint';
import type { spawnpointAttributes, spawnpointCreationAttributes } from './spawnpoint';
import { token } from './token';
import type { tokenAttributes, tokenCreationAttributes } from './token';
import { user } from './user';
import type { userAttributes, userCreationAttributes } from './user';
import { users } from './users';
import type { usersAttributes, usersCreationAttributes } from './users';
import { weather } from './weather';
import type { weatherAttributes, weatherCreationAttributes } from './weather';
import { web_session } from './web_session';
import type { web_sessionAttributes, web_sessionCreationAttributes } from './web_session';

export {
	account,
	assignment,
	communities,
	device,
	device_group,
	device_group_device,
	discord_rule,
	group,
	guild,
	gym,
	ingress_portals,
	instance,
	invasion_stats,
	metadata,
	nests,
	poi,
	pokemon,
	pokemon_iv_stats,
	pokemon_shiny_stats,
	pokemon_stats,
	pokestop,
	quest_stats,
	raid_stats,
	s2cell,
	sessions,
	spawnpoint,
	token,
	user,
	users,
	weather,
	web_session,
};

export type {
	accountAttributes,
	accountCreationAttributes,
	assignmentAttributes,
	assignmentCreationAttributes,
	communitiesAttributes,
	communitiesCreationAttributes,
	deviceAttributes,
	deviceCreationAttributes,
	device_groupAttributes,
	device_groupCreationAttributes,
	device_group_deviceAttributes,
	device_group_deviceCreationAttributes,
	discord_ruleAttributes,
	discord_ruleCreationAttributes,
	groupAttributes,
	groupCreationAttributes,
	guildAttributes,
	guildCreationAttributes,
	gymAttributes,
	gymCreationAttributes,
	ingress_portalsAttributes,
	ingress_portalsCreationAttributes,
	instanceAttributes,
	instanceCreationAttributes,
	invasion_statsAttributes,
	invasion_statsCreationAttributes,
	metadataAttributes,
	metadataCreationAttributes,
	nestsAttributes,
	nestsCreationAttributes,
	poiAttributes,
	poiCreationAttributes,
	pokemonAttributes,
	pokemonCreationAttributes,
	pokemon_iv_statsAttributes,
	pokemon_iv_statsCreationAttributes,
	pokemon_shiny_statsAttributes,
	pokemon_shiny_statsCreationAttributes,
	pokemon_statsAttributes,
	pokemon_statsCreationAttributes,
	pokestopAttributes,
	pokestopCreationAttributes,
	quest_statsAttributes,
	quest_statsCreationAttributes,
	raid_statsAttributes,
	raid_statsCreationAttributes,
	s2cellAttributes,
	s2cellCreationAttributes,
	sessionsAttributes,
	sessionsCreationAttributes,
	spawnpointAttributes,
	spawnpointCreationAttributes,
	tokenAttributes,
	tokenCreationAttributes,
	userAttributes,
	userCreationAttributes,
	usersAttributes,
	usersCreationAttributes,
	weatherAttributes,
	weatherCreationAttributes,
	web_sessionAttributes,
	web_sessionCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
	account.initModel(sequelize);
	assignment.initModel(sequelize);
	communities.initModel(sequelize);
	device.initModel(sequelize);
	device_group.initModel(sequelize);
	device_group_device.initModel(sequelize);
	discord_rule.initModel(sequelize);
	group.initModel(sequelize);
	guild.initModel(sequelize);
	gym.initModel(sequelize);
	ingress_portals.initModel(sequelize);
	instance.initModel(sequelize);
	invasion_stats.initModel(sequelize);
	metadata.initModel(sequelize);
	nests.initModel(sequelize);
	poi.initModel(sequelize);
	pokemon.initModel(sequelize);
	pokemon_iv_stats.initModel(sequelize);
	pokemon_shiny_stats.initModel(sequelize);
	pokemon_stats.initModel(sequelize);
	pokestop.initModel(sequelize);
	quest_stats.initModel(sequelize);
	raid_stats.initModel(sequelize);
	s2cell.initModel(sequelize);
	sessions.initModel(sequelize);
	spawnpoint.initModel(sequelize);
	token.initModel(sequelize);
	user.initModel(sequelize);
	users.initModel(sequelize);
	weather.initModel(sequelize);
	web_session.initModel(sequelize);

	device.belongsToMany(device_group, {
		through: device_group_device as typeof Model,
		foreignKey: 'device_uuid',
		otherKey: 'device_group_name',
	});
	device_group.belongsToMany(device, {
		through: device_group_device as typeof Model,
		foreignKey: 'device_group_name',
		otherKey: 'device_uuid',
	});
	assignment.belongsTo(device, { foreignKey: 'device_uuid' });
	device.hasMany(assignment, { foreignKey: 'device_uuid' });
	assignment.belongsTo(device_group, { foreignKey: 'device_group_name' });
	device_group.hasMany(assignment, { foreignKey: 'device_group_name' });
	assignment.belongsTo(instance, { foreignKey: 'instance_name' });
	instance.hasMany(assignment, { foreignKey: 'instance_name' });
	assignment.belongsTo(instance, { foreignKey: 'source_instance_name' });
	instance.hasMany(assignment, { foreignKey: 'source_instance_name' });
	device.belongsTo(account, { foreignKey: 'account_username' });
	account.hasOne(device, { foreignKey: 'account_username' });
	device.belongsTo(instance, { foreignKey: 'instance_name' });
	instance.hasMany(device, { foreignKey: 'instance_name' });
	device_group_device.belongsTo(device_group, { foreignKey: 'device_group_name' });
	device_group.hasMany(device_group_device, { foreignKey: 'device_group_name' });
	device_group_device.belongsTo(device, { foreignKey: 'device_uuid' });
	device.hasMany(device_group_device, { foreignKey: 'device_uuid' });
	discord_rule.belongsTo(group, { foreignKey: 'group_name' });
	group.hasMany(discord_rule, { foreignKey: 'group_name' });
	gym.belongsTo(s2cell, { foreignKey: 'cell_id' });
	s2cell.hasMany(gym, { foreignKey: 'cell_id' });
	pokemon.belongsTo(s2cell, { foreignKey: 'cell_id' });
	s2cell.hasMany(pokemon, { foreignKey: 'cell_id' });
	pokemon.belongsTo(pokestop, { foreignKey: 'pokestop_id' });
	pokestop.hasMany(pokemon, { foreignKey: 'pokestop_id' });
	pokemon.belongsTo(spawnpoint, { foreignKey: 'spawn_id' });
	spawnpoint.hasMany(pokemon, { foreignKey: 'spawn_id' });
	pokestop.belongsTo(s2cell, { foreignKey: 'cell_id' });
	s2cell.hasMany(pokestop, { foreignKey: 'cell_id' });
	token.belongsTo(user, { foreignKey: 'username' });
	user.hasMany(token, { foreignKey: 'username' });
	user.belongsTo(group, { foreignKey: 'group_name' });
	group.hasMany(user, { foreignKey: 'group_name' });

	return {
		account: account,
		assignment: assignment,
		communities: communities,
		device: device,
		device_group: device_group,
		device_group_device: device_group_device,
		discord_rule: discord_rule,
		group: group,
		guild: guild,
		gym: gym,
		ingress_portals: ingress_portals,
		instance: instance,
		invasion_stats: invasion_stats,
		metadata: metadata,
		nests: nests,
		poi: poi,
		pokemon: pokemon,
		pokemon_iv_stats: pokemon_iv_stats,
		pokemon_shiny_stats: pokemon_shiny_stats,
		pokemon_stats: pokemon_stats,
		pokestop: pokestop,
		quest_stats: quest_stats,
		raid_stats: raid_stats,
		s2cell: s2cell,
		sessions: sessions,
		spawnpoint: spawnpoint,
		token: token,
		user: user,
		users: users,
		weather: weather,
		web_session: web_session,
	};
}
