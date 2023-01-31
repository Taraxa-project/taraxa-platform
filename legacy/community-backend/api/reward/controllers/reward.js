"use strict";
const Web3Utils = require("web3-utils");

module.exports = {
  async find() {
    const rewards = await strapi.connections.default.raw(`
      SELECT "eth_wallet", "total"
      FROM (SELECT 
                  u."eth_wallet",
                  (SELECT SUM(s.submission_reward)
                    FROM "submissions" s
                    WHERE s."user" = u.id
                      AND s.reviewed = TRUE
                      AND s.accepted = TRUE) as total
            FROM "users-permissions_user" u
            WHERE u."eth_wallet" IS NOT NULL
              AND u."eth_wallet" != ''
              AND u."kyc" = 'APPROVED'
            ORDER BY "total" DESC) i
      WHERE "total" IS NOT NULL
    `);

    const allRewards = [];

    for (const reward of rewards.rows) {
      let address = reward.eth_wallet;
      if(Web3Utils.isAddress(address)) {
        address = Web3Utils.toChecksumAddress(address)
      }
      allRewards.push({
        address,
        total: reward.total,
      });
    }

    return allRewards;
  },
};