const forgotPasswordTemplate = require('./email-templates/forgot-password');
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL'),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '3240543fbddff30cfc3e5955cee93ce1'),
    },
    forgotPassword: {
      from: 'no-reply@gcp.taraxa.io',
      replyTo: 'support@gcp.taraxa.io',
      emailTemplate: forgotPasswordTemplate,
    },
  },
});
