import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface weatherAttributes {
  id: number;
  level?: number;
  latitude: number;
  longitude: number;
  gameplay_condition?: number;
  wind_direction?: number;
  cloud_level?: number;
  rain_level?: number;
  wind_level?: number;
  snow_level?: number;
  fog_level?: number;
  special_effect_level?: number;
  severity?: number;
  warn_weather?: number;
  updated: number;
}

export type weatherPk = "id";
export type weatherId = weather[weatherPk];
export type weatherCreationAttributes = Optional<weatherAttributes, weatherPk>;

export class weather extends Model<weatherAttributes, weatherCreationAttributes> implements weatherAttributes {
  id!: number;
  level?: number;
  latitude!: number;
  longitude!: number;
  gameplay_condition?: number;
  wind_direction?: number;
  cloud_level?: number;
  rain_level?: number;
  wind_level?: number;
  snow_level?: number;
  fog_level?: number;
  special_effect_level?: number;
  severity?: number;
  warn_weather?: number;
  updated!: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof weather {
    weather.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    latitude: {
      type: DataTypes.DOUBLE(18,14),
      allowNull: false,
      defaultValue: 0.00000000000000
    },
    longitude: {
      type: DataTypes.DOUBLE(18,14),
      allowNull: false,
      defaultValue: 0.00000000000000
    },
    gameplay_condition: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    wind_direction: {
      type: DataTypes.MEDIUMINT,
      allowNull: true
    },
    cloud_level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    rain_level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    wind_level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    snow_level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    fog_level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    special_effect_level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    severity: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    warn_weather: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    updated: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'weather',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return weather;
  }
}
