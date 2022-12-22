export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV || "dev",
  isProd: process.env.NODE_ENV === "prod",
});
