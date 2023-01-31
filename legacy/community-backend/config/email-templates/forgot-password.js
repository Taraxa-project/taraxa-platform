const subject = `Reset password`;

const html = `<p>Hi <%= user.firstname %></p>
<p>Sorry you lost your password. You can click here to reset it: <%= url %></p>`;

const text = `Hi <%= user.firstname %>
Sorry you lost your password. You can click here to reset it: <%= url %>`;

module.exports = {
  subject,
  text,
  html,
};
