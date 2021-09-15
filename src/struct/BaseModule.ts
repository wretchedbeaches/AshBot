import { Client } from "discord.js";
import BaseHandler from "./BaseHandler";
import Category from "./Category";

export interface BaseModuleOptions {
  category: string;
}

export interface BaseModuleAttributes {
  client: Client;
  id: string;
  categoryID: string;
  category: Category;
  filepath: string;
  handler: BaseHandler;
}

export default class BaseModule implements BaseModuleAttributes {
  public client: Client;
  public id: string;
  public categoryID: string;
  public category: Category;
  public filepath: string;
  public handler: BaseHandler;

  public constructor(id: string, options: BaseModuleOptions) {
    this.id = id;
    this.categoryID = options.category || 'default';
    this.filepath = null;
    this.handler = null;
    this.client = null;
  }

  public reload(): BaseModule {
    return this.handler.reload(this.id);
  }

  public remove(): BaseModule {
    return this.handler.remove(this.id);
  }

  public toString(): string {
    return this.id;
  }
}
