import moment from 'moment';
import { join } from 'path';
import { createLogger, format, Logger, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import BotClient from '../client/BotClient';

export const LOGGING_LEVEL: string = process.env.LOGGING_LEVEL ?? 'debug';
export const LOGGING_TIMEZONE: string = process.env.LOGGING_TIMEZONE ?? 'UTC';

// TODO: Setup a sequelize based logger transport.
// Disable the file and console logging on production.
export default class LogManager {
	public client: BotClient;
	public logger: Logger;

	public constructor(client: BotClient) {
		this.client = client;
		this.logger = createLogger({
			format: format.combine(
				format.errors({ stack: true }),
				format.timestamp({ format: (): string => moment.tz(LOGGING_TIMEZONE).format('YYYY-MM-DD HH:mm:ss Z') }),
				format.printf((info) => {
					const {
						timestamp,
						level,
						message,
						topic,
						event,
						userId,
						guildId,
						command,
						...rest
					}: { [key: string]: string } = info;
					return `[${timestamp}][${level.toUpperCase()}][${topic}]${event ? `[${event}]` : ''}${
						guildId ? `[guild:: ${guildId}]` : ''
					} ${userId ? `[user: ${userId}]` : ''} ${command ? `[command: ${command}]` : ''}
					}: ${message}${Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : ''}`;
				}),
			),
			transports: [
				new transports.Console({
					format: format.colorize({ level: true }),
					level: LOGGING_LEVEL,
				}),
				new DailyRotateFile({
					format: format.combine(format.timestamp(), format.json()),
					level: LOGGING_LEVEL,
					filename: `ashbot-%DATE%.log`,
					maxFiles: '14d',
					dirname: process.env.LOG_DIRECTORY ?? join(__dirname, '..', '..', 'logs'),
				}),
			],
		});
	}

	public debug(message: string, log = {}) {
		this.logger.debug(message, log);
	}

	public info(message: string, log = {}) {
		this.logger.info(message, log);
	}

	public warn(message: string, log = {}) {
		this.logger.warn(message, log);
	}

	public error(message: string, log = {}) {
		this.logger.error(message, log);
	}
}
