"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

const moment = require("moment");
module.exports = {
  lifecycles: {
    async afterFind(results, params, populate) {
      results.map(async (result) => {
        if (moment.utc(result.end_date) < moment(new Date())) {
          const updatedBounty = await strapi
            .query("bounty")
            .update({ id: result.id }, { state: 2 });
        }
      });
    },
  },
};
