const _ = require('lodash');
const { sanitizeEntity } = require('strapi-utils');
const axios = require('axios');
const crypto = require('crypto');
const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const formatError = error => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] },
];



module.exports = {
  async forgotPassword(ctx) {
    let { email, token } = ctx.request.body;
    const gres = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=6LdLJXAaAAAAALsfpslEdIBHpW-OYKPuUwFT2lbY&response=${token}`)
    if (!gres.data.success) {
            return ctx.badRequest(
                null,
                formatError({
                    id: 'Auth.form.error.invalid.token',
                    message: 'Seems like there is an issue with your request. Please wait a couple of minutes and try again.',
                })
                );
        }

    // Check if the provided email is valid or not.
    const isEmail = emailRegExp.test(email);

    if (isEmail) {
      email = email.toLowerCase();
    } else {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.email.format',
          message: 'Please provide valid email address.',
        })
      );
    }

    const pluginStore = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
    });

    // Find the user by email.
    const user = await strapi
      .query('user', 'users-permissions')
      .findOne({ email: email.toLowerCase() });

    // User not found.
    if (!user) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.user.not-exist',
          message: 'This email does not exist.',
        })
      );
    }

    // Generate random token.
    const resetPasswordToken = crypto.randomBytes(64).toString('hex');
    const settings = await pluginStore.get({ key: 'email' }).then(storeEmail => {
      try {
        return storeEmail['reset_password'].options;
      } catch (error) {
        return {error: error};
      }
    });

    const advanced = await pluginStore.get({
      key: 'advanced',
    });

    const userInfo = sanitizeEntity(user, {
      model: strapi.query('user', 'users-permissions').model,
    });

    settings.message = await strapi.plugins['users-permissions'].services.userspermissions.template(
      settings.message,
      {
        URL: advanced.email_reset_password,
        USER: userInfo,
        TOKEN: resetPasswordToken,
      }
    );

    settings.object = await strapi.plugins['users-permissions'].services.userspermissions.template(
      settings.object,
      {
        USER: userInfo,
      }
    );

    try {
      // Send an email to the user.
      await strapi.plugins['email'].services.email.send({
        to: user.email,
        from:
          settings.from.email || settings.from.name
            ? `${settings.from.name} <${settings.from.email}>`
            : undefined,
        replyTo: settings.response_email,
        subject: settings.object,
        text: settings.message,
        html: settings.message,
      });
    } catch (err) {
      return ctx.badRequest(null, err);
    }

    // Update the user.
    await strapi.query('user', 'users-permissions').update({ id: user.id }, { resetPasswordToken });

    ctx.send({ ok: true });
  },


    async register(ctx) {
        const pluginStore = await strapi.store({
          environment: '',
          type: 'plugin',
          name: 'users-permissions',
        });
    
        const settings = await pluginStore.get({
          key: 'advanced',
        });
    
        if (!settings.allow_register) {
          return ctx.badRequest(
            null,
            formatError({
              id: 'Auth.advanced.allow_register',
              message: 'Register action is currently disabled.',
            })
          );
        }
    
        const params = {
          ..._.omit(ctx.request.body, ['kyc', 'points', 'confirmed', 'confirmationToken', 'resetPasswordToken']),
          provider: 'local',
        };

        if(!params.skipRecaptcha) {
          const gres = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=6LdLJXAaAAAAALsfpslEdIBHpW-OYKPuUwFT2lbY&response=${params.token}`)

          if (!gres.data.success) {
              return ctx.badRequest(
                  null,
                  formatError({
                      id: 'Auth.form.error.invalid.token',
                      message: 'Seems like there is an issue with your submission. Please wait a couple of minutes and try again.',
                  })
                  );
          }
        }
    
        // Password is required.
        if (!params.password) {
          return ctx.badRequest(
            null,
            formatError({
              id: 'Auth.form.error.password.provide',
              message: 'Please provide your password.',
            })
          );
        }
    
        // Email is required.
        if (!params.email) {
          return ctx.badRequest(
            null,
            formatError({
              id: 'Auth.form.error.email.provide',
              message: 'Please provide your email.',
            })
          );
        }
    
        // Throw an error if the password selected by the user
        // contains more than three times the symbol '$'.
        if (strapi.plugins['users-permissions'].services.user.isHashed(params.password)) {
          return ctx.badRequest(
            null,
            formatError({
              id: 'Auth.form.error.password.format',
              message: 'Your password cannot contain more than three times the symbol `$`.',
            })
          );
        }
    
        const role = await strapi
          .query('role', 'users-permissions')
          .findOne({ type: settings.default_role }, []);
    
        if (!role) {
          return ctx.badRequest(
            null,
            formatError({
              id: 'Auth.form.error.role.notFound',
              message: 'Impossible to find the default role.',
            })
          );
        }
    
        // Check if the provided email is valid or not.
        const isEmail = emailRegExp.test(params.email);
    
        if (isEmail) {
          params.email = params.email.toLowerCase();
        } else {
          return ctx.badRequest(
            null,
            formatError({
              id: 'Auth.form.error.email.format',
              message: 'Please provide valid email address.',
            })
          );
        }
    
        params.role = role.id;
        params.password = await strapi.plugins['users-permissions'].services.user.hashPassword(params);
    
        const user = await strapi.query('user', 'users-permissions').findOne({
          email: params.email,
        });
    
        if (user && user.provider === params.provider) {
          return ctx.badRequest(
            null,
            formatError({
              id: 'Auth.form.error.email.taken',
              message: 'Email is already taken.',
            })
          );
        }
    
        if (user && user.provider !== params.provider && settings.unique_email) {
          return ctx.badRequest(
            null,
            formatError({
              id: 'Auth.form.error.email.taken',
              message: 'Email is already taken.',
            })
          );
        }

        const userByUsername = await strapi.query('user', 'users-permissions').findOne({
          username: params.username,
        });

        if (userByUsername) {
          return ctx.badRequest(
            null,
            formatError({
              id: 'Auth.form.error.username.taken',
              message: 'Username already taken',
            })
          );
        }
    
        try {
          if (!settings.email_confirmation) {
            params.confirmed = true;
          }
    
          const user = await strapi.query('user', 'users-permissions').create(params);
    
          const sanitizedUser = sanitizeEntity(user, {
            model: strapi.query('user', 'users-permissions').model,
          });
    
          if (settings.email_confirmation) {
            try {
              await strapi.plugins['users-permissions'].services.user.sendConfirmationEmail(user);
            } catch (err) {
              return ctx.badRequest(null, err);
            }
    
            return ctx.send({ user: sanitizedUser });
          }
    
          const jwt = strapi.plugins['users-permissions'].services.jwt.issue(_.pick(user, ['id']));
    
          return ctx.send({
            jwt,
            user: sanitizedUser,
          });
        } catch (err) {
          const adminError = _.includes(err.message, 'username')
            ? {
                id: 'Auth.form.error.username.taken',
                message: 'Username already taken',
              }
            : { id: 'Auth.form.error.email.taken', message: 'Email already taken' };
    
          ctx.badRequest(null, formatError(adminError));
        }
      }

}