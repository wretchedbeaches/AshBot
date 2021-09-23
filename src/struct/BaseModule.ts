import BaseClient from '../client/BotClient';
import BaseHandler from './BaseHandler';
import Category from './Category';

export interface BaseModuleOptions {
	category?: string;
}

export interface BaseModuleAttributes {
	client: BaseClient | null;
	id: string;
	categoryID: string;
	category?: Category;
	filepath: string | null;
	handler: BaseHandler | null;
}

export default class BaseModule implements BaseModuleAttributes {
	public client: BaseClient | null;
	public id: string;
	public categoryID: string;
	public category: Category;
	public filepath: string | null;
	public handler: BaseHandler | null;

	public constructor(id: string, { category = 'default' }: BaseModuleOptions) {
		this.id = id;
		this.categoryID = category;
		this.filepath = null;
		this.handler = null;
		this.client = null;
	}

	public reload(): BaseModule | null {
		if (this.handler === null) return null;
		return this.handler.reload(this.id);
	}

	public remove(): BaseModule | null {
		if (this.handler === null) return null;
		return this.handler.remove(this.id);
	}

	public toString(): string {
		return this.id;
	}
}
