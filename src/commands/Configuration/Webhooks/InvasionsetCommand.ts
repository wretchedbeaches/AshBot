import { stripIndents } from 'common-tags';
import COMMAND_NAMES from '../../../util/CommandNames';
import BaseHookCommand from './BaseHookCommand';

export default class InvasionHookCommand extends BaseHookCommand {
	public constructor() {
		super(COMMAND_NAMES.CONFIGURATION.WEBHOOKS.INVASION, {
			webhookType: 'invasion',
			description: {
				content: 'Set or remove the invasion webhook configuration for a particular channel.',
				usage: stripIndents`invasionset
        leader \`true|false\`
        geofilter \`distance(km/m) lattitude,longitude|city\`
        train`,
			},
		});
	}
}
