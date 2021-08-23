import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface nestsAttributes {
  nest_id: number;
  lat?: number;
  lon?: number;
  pokemon_id?: number;
  pokemon_form?: number;
  name?: string;
  pokemon_count?: number;
  pokemon_avg?: number;
  pokemon_ratio?: number;
  polygon_type?: number;
  polygon_path?: string;
  type: number;
  updated?: number;
}

export type nestsPk = 'nest_id';
export type nestsId = nests[nestsPk];
export type nestsCreationAttributes = Optional<nestsAttributes, nestsPk>;

export class nests
  extends Model<nestsAttributes, nestsCreationAttributes>
  implements nestsAttributes {
  nest_id!: number;
  lat?: number;
  lon?: number;
  pokemon_id?: number;
  pokemon_form?: number;
  name?: string;
  pokemon_count?: number;
  pokemon_avg?: number;
  pokemon_ratio?: number;
  polygon_type?: number;
  polygon_path?: string;
  type!: number;
  updated?: number;

  static initModel(sequelize: Sequelize.Sequelize): typeof nests {
    nests.init(
      {
        nest_id: {
          autoIncrement: true,
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
        },
        lat: {
          type: DataTypes.DOUBLE(18, 14),
          allowNull: true,
        },
        lon: {
          type: DataTypes.DOUBLE(18, 14),
          allowNull: true,
        },
        pokemon_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        pokemon_form: {
          type: DataTypes.SMALLINT,
          allowNull: true,
        },
        name: {
          type: DataTypes.STRING(250),
          allowNull: true,
        },
        pokemon_count: {
          type: DataTypes.DOUBLE,
          allowNull: true,
          defaultValue: 0,
        },
        pokemon_avg: {
          type: DataTypes.DOUBLE,
          allowNull: true,
          defaultValue: 0,
        },
        pokemon_ratio: {
          type: DataTypes.DOUBLE,
          allowNull: true,
          defaultValue: 0,
        },
        polygon_type: {
          type: DataTypes.TINYINT,
          allowNull: true,
          defaultValue: 0,
        },
        polygon_path: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        type: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: 0,
        },
        updated: {
          type: DataTypes.BIGINT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'nests',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'nest_id' }],
          },
          {
            name: 'CoordsIndex',
            using: 'BTREE',
            fields: [{ name: 'lat' }, { name: 'lon' }],
          },
          {
            name: 'UpdatedIndex',
            using: 'BTREE',
            fields: [{ name: 'updated' }],
          },
        ],
      }
    );
    return nests;
  }
}
