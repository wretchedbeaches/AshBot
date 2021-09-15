import { Collection } from "discord.js";

type ModelIdentifier = string | number;

interface SequelizeProviderAttributes {
    table: any,
    idColumn: string,
    dataColumn?: string,
    items: Collection<number | string, any>,
}

class SequelizeProvider implements SequelizeProviderAttributes {
    table: any;
    idColumn: string;
    dataColumn?: string;
    items: Collection<ModelIdentifier, any>;
    
    constructor(table, { idColumn = 'id', dataColumn = null } = {}) {

        /**
         * Sequelize model.
         * @type {Model}
         */
        this.table = table;
        this.idColumn = idColumn;
        this.dataColumn = dataColumn;
    }

    async init(): Promise<void> {
        const rows = await this.table.findAll();
        for (const row of rows) {
            this.items.set(row[this.idColumn], this.dataColumn === null ? row : row[this.dataColumn]);
        }
    }

    get(id: ModelIdentifier, key: string, defaultValue: any): typeof this.table {
        if (this.items.has(id)) {
            const value = this.items.get(id)[key];
            return value == null ? defaultValue : value;
        }

        return defaultValue;
    }

    set(id: ModelIdentifier, key: string, value: any): Promise<boolean> {
        const data = this.items.get(id) || {};
        data[key] = value;
        this.items.set(id, data);

        if (this.dataColumn != null) {
            return this.table.upsert({
                [this.idColumn]: id,
                [this.dataColumn]: data
            });
        }

        return this.table.upsert({
            [this.idColumn]: id,
            [key]: value
        });
    }

    delete(id: ModelIdentifier, key: string): Promise<boolean> {
        const data = this.items.get(id) || {};
        delete data[key];

        if (this.dataColumn != null) {
            return this.table.upsert({
                [this.idColumn]: id,
                [this.dataColumn]: data
            });
        }

        return this.table.upsert({
            [this.idColumn]: id,
            [key]: null
        });
    }

    clear(id: ModelIdentifier): Promise<void> {
        this.items.delete(id);
        return this.table.destroy({ where: { [this.idColumn]: id } });
    }
}

export default SequelizeProvider;
