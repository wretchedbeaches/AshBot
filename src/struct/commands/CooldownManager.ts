import { Collection, CommandInteraction, Interaction } from 'discord.js';
import { EventEmitter } from 'events';
import BotClient from '../../client/BotClient';
import { CooldownManagerEvents } from '../Util';
import Command, { CooldownIgnorer } from './Command';
import { CooldownData } from './CommandHandler';

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
	public cooldowns: Collection<string, CooldownData>;
	public defaultCooldown: number;

	public constructor(client, options: CooldownManagerOptions) {
		super();
		this.client = client;
		const { defaultCooldown } = options;
		this.defaultCooldown = defaultCooldown ?? 0;
		this.cooldowns = new Collection();
	}

	public async runCooldowns(interaction: CommandInteraction, command: Command): Promise<boolean> {
		console.log(`Checking cooldown for ${command.id}`);
		if (command.cooldown <= 0) return false;
		const cooldownIdentifier = this.getCooldownIdentifier(interaction, command);
		if (cooldownIdentifier != null) {
			const ignorer: CooldownIgnorer = command.ignoreCooldown;
			const isIgnored = Array.isArray(ignorer)
				? ignorer.includes(interaction.user.id)
				: await ignorer({ interaction, command });

			if (isIgnored) return false;
			console.log('Not ignored.');
			const time = command.cooldown >= 0 ? command.cooldown : this.defaultCooldown;
			if (!time) return false;

			const endTime = interaction.createdTimestamp + time;

			if (!this.cooldowns.has(cooldownIdentifier))
				this.cooldowns.set(cooldownIdentifier, {
					timer: setTimeout(() => {
						if (this.cooldowns.has(cooldownIdentifier)) {
							const commandCooldownData = this.cooldowns.get(cooldownIdentifier);
							if (commandCooldownData) clearTimeout(commandCooldownData.timer);
						}

						this.cooldowns.delete(cooldownIdentifier);
					}, time),
					end: endTime,
					uses: 0,
				});

			const cooldown = this.cooldowns.get(cooldownIdentifier)!;
			if (cooldown.uses >= command.rateLimit) {
				const diff = cooldown.end - interaction.createdTimestamp;

				this.emit(CooldownManagerEvents.COOLDOWN, { interaction, command, remainingTime: diff });
				return true;
			}

			cooldown.uses++;
			console.log(`Used command: ${cooldown.uses}`);
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
				if (interaction.guildId) return `${cooldownPrefix}-${interaction.user.id}-${interaction.guildId}`;
				return null;
			case CooldownScope.GUILD:
				if (interaction.guildId) return `${cooldownPrefix}-${interaction.guildId}`;
				return null;
			default:
				return null;
		}
	}
}
