'use strict';

const { assert } = require('check-types');
const joi = require('joi');

const coerceAfter = {
  duration: require('./coerce-duration'),
};
const coerceBefore = {
  string: require('./coerce-string'),
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
  const path = keys.join('.');
  let value = await readValue({
    client,
    file,
    ignoreSecrets,
    prefix,
    project,
    schema,
  });

  if (schema.required) {
    assert.not.undefined(value, `\`${path}\` is required`);
  }

  if (value !== undefined) {
    if (schema.coerce && coerceBefore[schema.coerce.from]) {
      const coercion = coerceBefore[schema.coerce.from][schema.coerce.to];
      assert.function(coercion, `\`${path}.coerce\` must be a function`);
      value = coercion(value);
    }

    if (schema.schema) {
      value = joi.attempt(value, schema.schema);
    }

    if (schema.coerce && coerceAfter[schema.coerce.from]) {
      const coercion = coerceAfter[schema.coerce.from][schema.coerce.to];
      assert.function(coercion, `\`${path}.coerce\` must be a function`);
      value = coercion(value);
    }

    return value;
  }

  let config;

  await Promise.all(
    Object.entries(schema).map(async ([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
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
