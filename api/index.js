const app = require('../backend/dist/index.cjs');

const handler = app.default || app;

module.exports = (req, res) => {
  return handler(req, res);
};
