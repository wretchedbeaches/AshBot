import { CooldownData } from 'discord-akairo';
import { Collection, CommandInteraction, Interaction } from 'discord.js';
import { EventEmitter } from 'events';
import BotClient from '../../client/BotClient';
import { CooldownManagerEvents } from '../Util';
import Command, { CooldownIgnorer } from './Command';

export enum CooldownScope {
	USER = 'user',
	MEMBER = 'member',
	GUILD = 'guild',
}

export interface CooldownManagerOptions {
	defaultCooldown?: number;
}

export default class CooldownManager extends EventEmitter {
	public client: BotClient;
	public userCooldowns: Collection<string, Collection<string, CooldownData>>;
	public guildCooldowns: Collection<string, Collection<string, CooldownData>>;
	public defaultCooldown: number;

	public constructor(client, options: CooldownManagerOptions) {
		super();
		this.client = client;
		const { defaultCooldown } = options;
		this.defaultCooldown = defaultCooldown ?? 0;
		this.userCooldowns = new Collection();
		this.guildCooldowns = new Collection();
	}

	public async runCooldowns(interaction: CommandInteraction, command: Command): Promise<boolean> {
		if (command.cooldown <= 0) return false;
		const cooldownIdentifier = this.getCooldownIdentifier(interaction, command);
		if (cooldownIdentifier != null) {
			const ignorer: CooldownIgnorer = command.ignoreCooldown;
			const isIgnored = Array.isArray(ignorer)
				? ignorer.includes(interaction.user.id)
				: await ignorer({ interaction, command });

			if (isIgnored) return false;

			const time = command.cooldown >= 0 ? command.cooldown : this.defaultCooldown;
			if (!time) return false;

			const endTime = interaction.createdTimestamp + time;

			const entry =
				command.cooldownScope === CooldownScope.GUILD
					? this.handleGuildCooldown(interaction.guildId!, cooldownIdentifier, time, endTime)
					: this.handleUserCooldown(interaction.user.id, cooldownIdentifier, time, endTime);

			if (entry.uses >= command.rateLimit) {
				const diff = entry.end - interaction.createdTimestamp;

				this.emit(CooldownManagerEvents.COOLDOWN, { interaction, command, remainingTime: diff });
				return true;
			}

			entry.uses++;
			return false;
		}
		return false;
	}

	private handleUserCooldown(userId: string, cooldownIdentifier: string, time: number, endTime: number): CooldownData {
		// If user cooldowns don't exist create them.
		if (!this.userCooldowns.has(userId)) this.userCooldowns.set(userId, new Collection());

		const userCooldowns = this.userCooldowns.get(userId) as Collection<string, CooldownData>;
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
						this.userCooldowns.delete(userId);
					}
				}, time),
				end: endTime,
				uses: 0,
			});
		}
		return userCooldowns.get(cooldownIdentifier) as CooldownData;
	}

	private handleGuildCooldown(guildId: string, cooldownIdentifier: string, time: number, endTime: number) {
		if (!this.guildCooldowns.has(guildId)) this.guildCooldowns.set(guildId, new Collection());

		const guildCooldowns = this.guildCooldowns.get(guildId) as Collection<string, CooldownData>;
		if (!guildCooldowns.has(cooldownIdentifier)) {
			guildCooldowns.set(cooldownIdentifier, {
				timer: setTimeout(() => {
					if (guildCooldowns.has(cooldownIdentifier)) {
						const commandCooldownData = guildCooldowns.get(cooldownIdentifier);
						if (commandCooldownData) clearTimeout(commandCooldownData.timer);
					}
					guildCooldowns.get(cooldownIdentifier);

					if (guildCooldowns.size === 0) {
						this.guildCooldowns.delete(guildId);
					}
				}, time),
				end: endTime,
				uses: 0,
			});
		}
		return guildCooldowns.get(cooldownIdentifier) as CooldownData;
	}

	public getCooldownIdentifier(interaction: Interaction, command: Command): string | null {
		const cooldownPrefix = `${command.cooldownScope}-${command.id}`;
		switch (command.cooldownScope) {
			case CooldownScope.USER:
				return cooldownPrefix;
			case CooldownScope.MEMBER:
				// TODO: Emit an error here?
				if (interaction.guildId) return `${cooldownPrefix}-${interaction.guildId}`;
				return null;
			case CooldownScope.GUILD:
				if (interaction.guildId) return `${cooldownPrefix}-${interaction.guildId}`;
				return null;
			default:
				return null;
		}
	}
}
