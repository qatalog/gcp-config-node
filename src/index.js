'use strict';

const fs = require('fs/promises');

const { assert } = require('check-types');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const buildConfig = require('./build-config');

module.exports = {
  load,
};

async function load({ file, ignoreSecrets, prefix, project, schema }) {
  assert.maybe.boolean(ignoreSecrets, 'invalid `ignoreSecrets` option');
  assert.maybe.nonEmptyString(file, 'invalid `file` option');
  assert.maybe.nonEmptyString(prefix, 'invalid `prefix` option');
  assert.nonEmptyString(project, 'invalid `project` option');
  assert.nonEmptyObject(schema, 'invalid `schema` option');

  const client = new SecretManagerServiceClient();

  if (file) {
    file = JSON.parse(await fs.readFile(file, 'utf8'));
  }

  return buildConfig({ client, file, ignoreSecrets, prefix, project, schema });
}
