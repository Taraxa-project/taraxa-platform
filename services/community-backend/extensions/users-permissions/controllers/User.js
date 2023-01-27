"use strict";

const request = require("request");

/**
 * User.js controller
 *
 * @description: A set of functions called "actions" for managing `User`.
 */

module.exports = {
  /**
   * Retrieve the KYC URL for a user.
   * @return {Object|Array}
   */
  async kyc(ctx) {
    // Find the user by id.
    const user = await strapi
      .query("user", "users-permissions")
      .findOne({ id: ctx.state.user.id });

    // User not found.
    if (!user) {
      return ctx.badRequest("This user does not exist.");
    }

    if (user.kycLink) {
      ctx.body = { kycLink: user.kycLink };
      return;
    }

    const apiToken = strapi.config.get(
        "plugins.userspermissions.kyc.apiToken",
        ""
      ),
      apiSecret = strapi.config.get(
        "plugins.userspermissions.kyc.apiSecret",
        ""
      ),
      serverUrl = strapi.config.get("server.url", ""),
      siteUrl = serverUrl.replace("api.", "");

    var options = {
      url: "https://netverify.com/api/v4/initiate",
      method: "POST",
      json: true,
      body: {
        customerInternalReference: "TARAXAGENERATED",
        userReference: user.id,
        callbackUrl: `${serverUrl}/users/kyc-callback`,
        successUrl: `${siteUrl}/profile`,
        errorUrl: `${siteUrl}/profile`,
        tokenLifetimeInMinutes: 60 * 24 * 60,
      },
      auth: {
        user: apiToken,
        password: apiSecret,
      },
      headers: {
        "User-Agent": "Taraxa Community/1.0.0",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    const response = new Promise((resolve, reject) => {
      request(options, (err, res, body) => {
        if (!err && res.statusCode == 200) {
          resolve(body.redirectUrl);
        } else {
          reject(err ? err : body);
        }
      });
    });

    const now = new Date();
    const kycExpiry = now.setDate(now.getDate() + 60);

    try {
      const kycLink = await response;
      strapi.query("user", "users-permissions").update(
        { id: user.id },
        {
          kyc: "VERIFYING",
          kycLink,
          kycExpiry,
        }
      );
      ctx.body = { kycLink };
    } catch (err) {
      console.log(err);
      return ctx.badRequest("KYC link creation failed");
    }
  },

  /**
   * Set the KYC status for a user
   * @return {Object|Array}
   */
  async kycCallback(ctx) {
    const { customerId, identityVerification } = ctx.request.body;
    const id = parseInt(customerId, 10);

    const user = await strapi
      .query("user", "users-permissions")
      .findOne({ id });

    if (!user) {
      return ctx.badRequest("This user does not exist.");
    }

    try {
      const idVerification = JSON.parse(identityVerification);
      const similarity = idVerification["similarity"];

      let kycStatus = "DENIED";

      switch (similarity) {
        case "MATCH":
          kycStatus = "APPROVED";
          break;
        case "NO_MATCH":
        case "NOT_POSSIBLE":
          kycStatus = "DENIED";
          break;
        default:
          kycStatus = "DENIED";
      }

      strapi.query("user", "users-permissions").update(
        { id },
        {
          kyc: kycStatus,
        }
      );

      ctx.body = { status: true };
    } catch (e) {
      console.group("KYC callback error");
      console.log("customerId", customerId);
      console.log("body", ctx.request.body);
      console.groupEnd();
      return ctx.badRequest("Invalid request");
    }
  },
};
