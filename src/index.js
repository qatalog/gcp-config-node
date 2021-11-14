'use strict';

const { assert } = require('check-types');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

module.exports = {
  load,
};

async function load({ prefix, project, schema }) {
  assert.maybe.nonEmptyString(prefix);
  assert.nonEmptyString(project);
  assert.nonEmptyObject(schema);

  const client = new SecretManagerServiceClient();
  const config = {};

  await buildConfig({ client, config, prefix, project, schema });

  return config;
}

async function buildConfig({ client, config, keys = [], prefix, project, schema }) {
  const value = await readValue({ client, prefix, project, schema });

  if (value !== undefined) {
    setValue({ config, keys, value });
    return;
  }

  await Promise.all(Object.entries(schema).map(async ([key, value]) => {
    if (value && typeof value === 'object') {
      await buildConfig({ client, config, keys: [...keys, key], prefix, project, schema: value });
    }
  }));
}

async function readValue({ client, prefix, project, schema }) {
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
  } catch (_) {}
}

function setValue({ config, keys, value }) {
  const key = keys.shift();

  if (keys.length === 0) {
    config[key] = value;
  } else {
    if (!config[key]) {
      config[key] = {};
    }

    setValue({ config: config[key], keys, value });
  }
}
