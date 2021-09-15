import { Client, Collection } from "discord.js";
import BaseModule from "./BaseModule";
import Category from "./Category";
import path from "path";
import fs from 'fs';
import EventEmitter from 'events';

export interface BaseHandlerOptions {
    automateCategories?: boolean;
    directory: string;
    classToHandle: typeof BaseModule
};

export interface BaseHandlerAttributes {
    automateCategories: boolean;
    categories: Collection<string, Category>;
    classToHandle: typeof BaseModule;
    client: Client;
    directory: string;
    modules: Collection<string, BaseModule>;
}

export default class BaseHandler extends EventEmitter implements BaseHandlerAttributes {
    public automateCategories: boolean;
    public categories: Collection<string, Category>;
    public classToHandle: typeof BaseModule;
    public client: Client;
    public directory: string;
    public modules: Collection<string, BaseModule>;

    public constructor(client: Client, options: BaseHandlerOptions) {
        super();

        this.client = client;

        const {
            directory,
            classToHandle,
            automateCategories = false
        } = options;

        this.automateCategories = automateCategories;
        this.directory = directory;
        this.modules = new Collection<string, BaseModule>();
        this.categories = new Collection();
        this.classToHandle = classToHandle;
    }

    public register(module: BaseModule, filepath: string): void {
        module.filepath = filepath;
        module.client = this.client;
        module.handler = this;
        this.modules.set(module.id, module);

        if (module.categoryID === 'default' && this.automateCategories){
            const directories = path.dirname(filepath).split(path.sep);
            module.categoryID = directories[directories.length - 1];
        }

        if (!this.categories.has(module.categoryID)) {
            this.categories.set(module.categoryID, new Category(module.categoryID));
        }

        const category = this.categories.get(module.categoryID);
        module.category = category;
        category.set(module.id, module);
    }

    public deregister(module: BaseModule): void {
        if (module.filepath) delete require.cache[require.resolve(module.filepath)];
        this.modules.delete(module.id);
        module.category.delete(module.id);
    }

    public load(thing: string | Function, isReload: boolean = false): BaseModule {
        const isClass = typeof thing === 'function';
        if (!isClass && path.extname(thing) !== '.ts') return undefined;

        let module = isClass ? thing : function findExport(m) {
            if (!m) return null;
            if (m.prototype instanceof this.classToHandle) return module;
            return m.default ? findExport.call(this, m.default) : null;
        }.call(this, require(thing));

        if (module && module.prototype instanceof this.classToHandle) {
            module = new module(this);
        } else {
            if (!isClass) delete require.cache[require.resolve(thing)];
            return undefined;
        }

        // TODO Emit equivalent of AkairoHandlerEvents.LOAD
        // TODO: Throw error if already loaded.
        if (!this.modules.has(module.id)) {
            this.register(module, isClass ? null : thing);
            return module;
        }
        return undefined;
    }

    // TODO: Add a load filter?
    public loadAll(directory: string = this.directory): BaseHandler {
        const filepaths = BaseHandler.readdirRecursive(directory);
        for (let filepath of filepaths) {
            filepath = path.resolve(filepath);
            this.load(filepath);
        }
        return this;
    }
    
    // TODO: Throw modul enot found error
    // TODO: emit remove event
    public remove(id: string): BaseModule {
        const module = this.modules.get(id.toString());
        // if (!module) throw new AkairoError('MODULE_NOT_FOUND', this.classToHandle.name, id);
        if (module) {
            this.deregister(module);

            // this.emit(AkairoHandlerEvents.REMOVE, mod);
            return module;
        }
        return undefined;
    }
    
    public removeAll(): BaseHandler {
        for (const m of Array.from(this.modules.values())) {
            if (m.filepath) this.remove(m.id);
        }

        return this;
    }
    
    // TODO: throw module not found error
    // TODO: throw not reloadable error
    public reload(id: string): BaseModule {
        const module = this.modules.get(id.toString());
        // if (!module) throw new AkairoError('MODULE_NOT_FOUND', this.classToHandle.name, id);
        // if (!module.filepath) throw new AkairoError('NOT_RELOADABLE', this.classToHandle.name, id);
        if (module && module.filepath) {
            this.deregister(module);

            const filepath = module.filepath;
            const newMod = this.load(filepath, true);
            return newMod;
        }
        return undefined;
    }
    
    public reloadAll(): BaseHandler {
        for (const m of Array.from(this.modules.values())) {
            if (m.filepath) this.reload(m.id);
        }

        return this;
    }
    
    public findCategory(name: string): Category {
        return this.categories.find(category => {
            return category.id.toLowerCase() === name.toLowerCase();
        });
    }

    public static readdirRecursive(directory: string): string[] {
        const result = [];

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
        }(directory));

        return result;
    }
};