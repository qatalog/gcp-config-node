'use strict';

const fs = require('fs/promises');

const { assert } = require('check-types');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const buildConfig = require('./build-config');

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
