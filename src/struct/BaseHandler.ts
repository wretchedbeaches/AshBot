/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Collection } from 'discord.js';
import BaseModule from './BaseModule';
import Category from './Category';
import path from 'path';
import fs from 'fs';
import EventEmitter from 'events';
import BaseClient from '../client/BotClient';
import { BaseHandlerEvents, ErrorMessages } from './Util';

export interface BaseHandlerOptions {
	automateCategories?: boolean;
	directory: string;
}

export interface BaseHandlerAttributes {
	automateCategories: boolean;
	categories: Collection<string, Category>;
	classToHandle: new (...args: any[]) => BaseModule;
	client: BaseClient;
	directory?: string;
	modules: Collection<string, BaseModule>;
}

export default class BaseHandler extends EventEmitter implements BaseHandlerAttributes {
	public automateCategories: boolean;
	public categories: Collection<string, Category>;
	public classToHandle: new (...args: any[]) => BaseModule;
	public client: BaseClient;
	public directory: string;
	public modules: Collection<string, BaseModule>;

	// TODO: determine a default directory
	public constructor(client: BaseClient, { directory, automateCategories = false }: BaseHandlerOptions) {
		super();
		this.client = client;
		this.automateCategories = automateCategories;
		this.directory = directory;
		this.modules = new Collection<string, BaseModule>();
		this.categories = new Collection();
		this.classToHandle = BaseModule;
	}

	public register(module: BaseModule, filepath: string | null): void {
		module.filepath = filepath;
		module.client = this.client;
		module.handler = this;
		this.modules.set(module.id, module);

		if (filepath != null && module.categoryID === 'default' && this.automateCategories) {
			const directories = path.dirname(filepath).split(path.sep);
			module.categoryID = directories[directories.length - 1];
		}

		if (!this.categories.has(module.categoryID)) {
			this.categories.set(module.categoryID, new Category(module.categoryID));
		}

		const category = this.categories.get(module.categoryID) as Category;
		module.category = category;
		category.set(module.id, module);
	}

	public deregister(module: BaseModule): void {
		if (module.filepath) delete require.cache[require.resolve(module.filepath)];
		this.modules.delete(module.id);
		module.category.delete(module.id);
	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	public load(thing: string | Function, isReload = false): BaseModule | undefined {
		const isClass = typeof thing === 'function';
		if (!isClass && path.extname(thing as string) !== '.ts') return undefined;

		let module = isClass
			? thing
			: function findExport(m) {
					if (!m) return null;
					if (m.prototype instanceof this.classToHandle) return m;
					return m.default ? findExport.call(this, m.default) : null;
			  }.call(this, require(thing as string));

		if (module && module.prototype instanceof this.classToHandle) {
			module = new module(this);
			// TODO: is the client property not being set on commands?
			// Does this need to be done here?
		} else {
			if (!isClass) delete require.cache[require.resolve(thing as string)];
			return undefined;
		}

		if (this.modules.has(module.id)) throw new Error(ErrorMessages.ALREADY_LOADED(this.classToHandle.name, module.id));

		this.register(module, isClass ? null : (thing as string));
		this.emit(BaseHandlerEvents.LOAD, { module, isReload });
		return module;
	}

	// TODO: Add a load filter?
	public loadAll(directory = this.directory): BaseHandler | Promise<BaseHandler> {
		const filepaths = BaseHandler.readdirRecursive(directory);
		for (let filepath of filepaths) {
			filepath = path.resolve(filepath);
			this.load(filepath);
		}
		return this;
	}

	public remove(id: string): BaseModule {
		const module = this.modules.get(id);
		if (!module) throw new Error(ErrorMessages.MODULE_NOT_FOUND(this.classToHandle.name, id));
		this.deregister(module);
		this.emit(BaseHandlerEvents.REMOVE, module);
		return module;
	}

	public removeAll(): BaseHandler {
		for (const m of Array.from(this.modules.values())) {
			if (m.filepath) this.remove(m.id);
		}

		return this;
	}

	public reload(id: string): BaseModule | undefined {
		const module = this.modules.get(id);
		if (!module) throw new Error(ErrorMessages.MODULE_NOT_FOUND(this.classToHandle.name, id));
		if (!module.filepath) throw new Error(ErrorMessages.NOT_RELOADABLE(this.classToHandle.name, id));
		this.deregister(module);
		const filepath = module.filepath;
		const newMod = this.load(filepath, true);
		return newMod;
	}

	public reloadAll(): BaseHandler {
		for (const m of Array.from(this.modules.values())) {
			if (m.filepath) this.reload(m.id);
		}

		return this;
	}

	public findCategory(name: string): Category | undefined {
		return this.categories.find((category) => {
			return category.id.toLowerCase() === name.toLowerCase();
		});
	}

	public static readdirRecursive(directory: string | undefined): string[] {
		const result: string[] = [];
		if (directory === undefined) return result;

		(function read(dir) {
			const files = fs.readdirSync(dir);

			for (const file of files) {
				const filepath = path.join(dir, file);

				if (fs.statSync(filepath).isDirectory()) {
					read(filepath);
				} else {
					result.push(filepath);
				}
			}
		})(directory);

		return result;
	}
}
