import { CooldownData } from 'discord-akairo';
import { Collection, CommandInteraction, Interaction } from 'discord.js';
import { EventEmitter } from 'events';
import BotClient from '../../client/BotClient';
import { CooldownManagerEvents } from '../Util';
import Command, { CooldownIgnorer } from './Command';

export enum CooldownScope {
	USER = 'user',
	MEMBER = 'member',
}

export interface CooldownManagerOptions {
	defaultCooldown?: number;
}

export default class CooldownManager extends EventEmitter {
	public client: BotClient;
	public cooldowns: Collection<string, Collection<string, CooldownData>>;
	public defaultCooldown: number;

	public constructor(client, options: CooldownManagerOptions) {
		super();
		this.client = client;
		const { defaultCooldown } = options;
		this.cooldowns = new Collection();
		this.defaultCooldown = defaultCooldown ?? 0;
	}

	public async runCooldowns(interaction: CommandInteraction, command: Command): Promise<boolean> {
		const cooldownIdentifier = this.getCooldownIdentifier(interaction, command);
		if (cooldownIdentifier) {
			const ignorer: CooldownIgnorer = command.ignoreCooldown;
			const isIgnored = Array.isArray(ignorer)
				? ignorer.includes(interaction.user.id)
				: await ignorer({ interaction, command });

			if (isIgnored) return false;

			const time = command.cooldown >= 0 ? command.cooldown : this.defaultCooldown;
			if (!time) return false;

			const endTime = interaction.createdTimestamp + time;

			const userId = interaction.user.id;
			// If user cooldowns don't exist create them.
			if (!this.cooldowns.has(userId)) this.cooldowns.set(userId, new Collection());

			const userCooldowns = this.cooldowns.get(userId) as Collection<string, CooldownData>;
			// If a cooldown for the command doesn't exist yet create it.
			if (!userCooldowns.has(cooldownIdentifier)) {
				userCooldowns.set(cooldownIdentifier, {
					timer: setTimeout(() => {
						if (userCooldowns.has(cooldownIdentifier)) {
							const commandCooldownData = userCooldowns.get(cooldownIdentifier);
							if (commandCooldownData) clearTimeout(commandCooldownData.timer);
						}
						userCooldowns.get(cooldownIdentifier);

						if (userCooldowns.size === 0) {
							this.cooldowns.delete(userId);
						}
					}, time),
					end: endTime,
					uses: 0,
				});
			}

			const entry = userCooldowns.get(cooldownIdentifier) as CooldownData;

			if (entry.uses >= command.ratelimit) {
				const diff = entry.end - interaction.createdTimestamp;

				this.emit(CooldownManagerEvents.COOLDOWN, { interaction, command, remainingTime: diff });
				return true;
			}

			entry.uses++;
			return false;
		}
		return false;
	}

	public getCooldownIdentifier(interaction: Interaction, command: Command): string | null {
		const cooldownPrefix = `${command.cooldownScope}-${command.id}`;
		switch (command.cooldownScope) {
			case CooldownScope.USER:
				return cooldownPrefix;
			case CooldownScope.MEMBER:
				// TODO: Emit an error here?
				if (interaction.guildId) return `${cooldownPrefix}-${interaction.guildId}`;
			default:
				return null;
		}
	}
}
