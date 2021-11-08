const COMMAND_NAMES = {
	CONFIGURATION: {
		ADMIN: 'admin',
		WEBHOOKS: {
			INVASION: 'invasionhook',
			POKEMON: 'pokehook',
			QUEST: 'questhook',
			RAID: 'raidhook',
			MANAGE: 'webhooks',
		},
	},
	PUBLIC: {
		EIGHT_BALL: '8ball',
		CLEAR: 'clear',
		DISTANCE: 'distance',
		HELP: 'help',
		NEST: 'nestinglist',
		PING: 'ping',
		SEND_EMBED: 'sendembed',
		SERVER_INFO: 'serverinfo',
		STATS: 'stats',
		STEAL_EMOJI: 'stealemoji',
		WHO_IS: 'whois',
	},
	SEARCH: {
		NEST: 'nestsearch',
		POKEMON: 'pokesearch',
		QUEST: 'questsearch',
		RAID: 'raidsearch',
		RANK: 'ranksearch',
		WEATHER: 'weathersearch',
		WEATHER_API: 'weather2',
	},
} as const;

export default COMMAND_NAMES;
