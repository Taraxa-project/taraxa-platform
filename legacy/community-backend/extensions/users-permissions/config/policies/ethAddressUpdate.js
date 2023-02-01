const Web3Utils = require("web3-utils");

module.exports = async (ctx, next) => {
  if (ctx.state.user.role.name === "Administrator") {
    return next();
  }

  const { eth_wallet } = ctx.request.body;

  if ([null, undefined].includes(eth_wallet)) {
    return next();
  }

  const { id: currentUserId } = ctx.state.user;
  const userToUpdate = Number.parseInt(ctx.params.id, 10);

  if (currentUserId !== userToUpdate) {
    return ctx.unauthorized("Unable to edit this user ID");
  }

  const user = await strapi
    .query("user", "users-permissions")
    .findOne({ id: currentUserId });

  if (user.eth_wallet && user.eth_wallet.trim() !== "") {
    return ctx.badRequest("Wallet Address already set");
  }

  if (!Web3Utils.isAddress(eth_wallet.trim())) {
    return ctx.badRequest("Wallet Address is not valid");
  }

  ctx.request.body = {
    eth_wallet,
  };

  return next();
};
