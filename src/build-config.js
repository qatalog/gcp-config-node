'use strict';

const { assert } = require('check-types');
const joi = require('joi');

const coerce = {
  duration: require('./coerce-duration'),
};
const readValue = require('./read-value');

module.exports = buildConfig;

async function buildConfig({
  client,
  file,
  keys = [],
  ignoreSecrets,
  prefix,
  project,
  schema,
}) {
  let value = await readValue({
    client,
    file,
    ignoreSecrets,
    prefix,
    project,
    schema,
  });

  if (schema.required) {
    assert.not.undefined(value, `\`${keys.join('.')}\` is required`);
  }

  if (value !== undefined) {
    if (schema.schema) {
      value = joi.attempt(value, schema.schema);
    }

    if (schema.coerce) {
      const coercion = coerce[schema.coerce.from][schema.coerce.to];
      assert.function(coercion);
      value = coercion(value);
    }

    return value;
  }

  let config;

  await Promise.all(
    Object.entries(schema).map(async ([key, value]) => {
      if (value && typeof value === 'object') {
        if (!config) {
          config = {};
        }

        const childValue = await buildConfig({
          client,
          file: file?.[key],
          keys: [...keys, key],
          ignoreSecrets,
          prefix,
          project,
          schema: value,
        });

        if (childValue !== undefined) {
          config[key] = childValue;
        }
      }
    }),
  );

  return config;
}
