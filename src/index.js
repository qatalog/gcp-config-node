'use strict';

const fs = require('fs/promises');

const { assert } = require('check-types');
const joi = require('joi');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const coerce = {
  duration: require('./coerce-duration'),
};

module.exports = {
  load,
};

async function load({ file, prefix, project, schema }) {
  assert.maybe.nonEmptyString(file);
  assert.maybe.nonEmptyString(prefix);
  assert.nonEmptyString(project);
  assert.nonEmptyObject(schema);

  const client = new SecretManagerServiceClient();

  if (file) {
    file = JSON.parse(await fs.readFile(file, 'utf8'));
  }

  return buildConfig({ client, file, prefix, project, schema });
}

async function buildConfig({ client, file, prefix, project, schema }) {
  let value = await readValue({ client, file, prefix, project, schema });

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

async function readValue({ client, file, prefix, project, schema }) {
  const { env } = schema;

  if (env && process.env[env]) {
    return process.env[env];
  }

  let secret = schema.secret || env;
  if (secret) {
    if (prefix) {
      secret = `${prefix}${secret}`;
    }

    const value = await readSecret({ client, project, secret });
    if (value !== undefined) {
      return value;
    }
  }

  if (file !== undefined && typeof file !== 'object') {
    return file;
  }

  return schema.default;
}

async function readSecret({ client, project, secret }) {
  try {
    const name = `projects/${project}/secrets/${secret}/versions/latest`;
    let [version] = await client.getSecretVersion({ name });
    if (version.state === 'ENABLED') {
      [version] = await client.accessSecretVersion({ name });
      return version.payload.data.toString();
    }
  } catch (_) {
    // Secrets are read optimistically, so ignore errors
  }
}
