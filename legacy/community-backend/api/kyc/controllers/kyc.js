"use strict";
const Web3Utils = require("web3-utils");

module.exports = {
  async find() {
    const users = await strapi.connections.default.raw(`
      SELECT "eth_wallet", "kyc"
      FROM "users-permissions_user"
      WHERE "eth_wallet" IS NOT NULL
      AND "eth_wallet" != ''
      AND "kyc" = 'APPROVED'
    `);

    const allUsers = [];

    for (const user of users.rows) {
      let address = user.eth_wallet;
      if(Web3Utils.isAddress(address)) {
        address = Web3Utils.toChecksumAddress(address)
      }
      allUsers.push({
        address,
        kyc: user.kyc
      });
    }

    return allUsers;
  },
};