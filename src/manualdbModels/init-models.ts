import type { Sequelize, Model } from "sequelize";
import { communities } from "./communities";
import type { communitiesAttributes, communitiesCreationAttributes } from "./communities";
import { ingress_portals } from "./ingress_portals";
import type { ingress_portalsAttributes, ingress_portalsCreationAttributes } from "./ingress_portals";
import { nests } from "./nests";
import type { nestsAttributes, nestsCreationAttributes } from "./nests";
import { poi } from "./poi";
import type { poiAttributes, poiCreationAttributes } from "./poi";
import { users } from "./users";
import type { usersAttributes, usersCreationAttributes } from "./users";

export {
  communities,
  ingress_portals,
  nests,
  poi,
  users,
};

export type {
  communitiesAttributes,
  communitiesCreationAttributes,
  ingress_portalsAttributes,
  ingress_portalsCreationAttributes,
  nestsAttributes,
  nestsCreationAttributes,
  poiAttributes,
  poiCreationAttributes,
  usersAttributes,
  usersCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  communities.initModel(sequelize);
  ingress_portals.initModel(sequelize);
  nests.initModel(sequelize);
  poi.initModel(sequelize);
  users.initModel(sequelize);


  return {
    communities: communities,
    ingress_portals: ingress_portals,
    nests: nests,
    poi: poi,
    users: users,
  };
}
