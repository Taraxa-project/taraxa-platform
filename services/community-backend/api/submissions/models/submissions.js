"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    async beforeCreate(data) {
      const bounty = await strapi.query("bounty").findOne({ id: data.bounty });
      if (!bounty.allow_multiple_submissions) {
        const userBountySubmissions = await strapi
          .query("submissions")
          .count({ user: data.user, bounty: data.bounty });
        if (userBountySubmissions >= 1) {
          throw strapi.errors.badRequest(
            "This bounty only accepts one submission per user."
          );
        }
      }
    },
  },
};
