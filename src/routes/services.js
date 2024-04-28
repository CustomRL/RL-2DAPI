const express = require('express');
const config = require('../../config');
const fs = require('fs');

const router = express.Router();

const events = new Map();

const allEvents = fs.readdirSync('./src/routes/Services').map(f => f.split('.js')[0]);
for (const event of allEvents) {
  events.set(event, require(`./Services/${event}.js`))
}

router.post('/', async (req, res) => {
  const { body } = req;

  if (!body.Service) return res.status(400).send(error("NoService"));

  const [path, route] = body.Service.split('/');
  if (!path || !route) return res.status(400).send(error("NoService"));

  const event = events.get(route);
  if (!event) return res.status(400).send(error("InvalidService"));

  const expectedValues = Object.keys(event.expected);
  for (let value of expectedValues) {
    if (body[value] !== event.expected[value]) {
      return res.status(400).send(error("VersionMismatch"));
    }
  }

  if (body.Params.FeatureSet !== config.config.FeatureSet) {
    return res.status(400).send(error("FeatureMismatch"));
  }

  event.run({ res, body })
});


const error = (type) => {
  return ({ "Responses": [{ "ID": 1, "Error": { "Type": type, "Message": config.Types[type] } }] })
}

module.exports.error = error;

module.exports = router;

