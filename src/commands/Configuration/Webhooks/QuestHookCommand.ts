import { stripIndents } from 'common-tags';
import COMMAND_NAMES from '../../../util/CommandNames';
import BaseHookCommand from './BaseHookCommand';

export default class QuestHookCommand extends BaseHookCommand {
	public constructor() {
		super(COMMAND_NAMES.CONFIGURATION.WEBHOOKS.QUEST, {
			webhookType: 'quest',
			description: {
				content: 'Set or remove the quest webhook configuration for a particular channel',
				usage: stripIndents`questset
        reward \`reward type\`
        geofilter \`distance(km/m) latitude,longitude|city\``,
				examples: ['questset stardust'],
			},
		});
	}
}
