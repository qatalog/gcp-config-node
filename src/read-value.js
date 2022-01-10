'use strict';

// Error codes which should not be retried.
// Ref: https://github.com/googleapis/googleapis/blob/master/google/rpc/code.proto
const ERROR_CODES_NO_RETRY = new Set([
  3, // INVALID ARGUMENT
  5, // NOT FOUND
]);

module.exports = readValue;

async function readValue({
  client,
  file,
  ignoreSecrets,
  prefix,
  project,
  schema,
}) {
  let { env } = schema;
  if (typeof env !== 'string') {
    env = undefined;
  }

  if (env && process.env[env]) {
    return process.env[env];
  }

  let secret = schema.secret || env;
  if (secret && !ignoreSecrets) {
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

async function readSecret({ client, isRetry = false, project, secret }) {
  try {
    const name = `projects/${project}/secrets/${secret}/versions/latest`;
    let [version] = await client.getSecretVersion({ name });
    if (version.state === 'ENABLED') {
      [version] = await client.accessSecretVersion({ name });
      return version.payload.data.toString();
    }
  } catch (e) {
    if (!isRetry && !ERROR_CODES_NO_RETRY.has(e.code)) {
      // Retry once to mitigate intermittent network failure
      return readSecret({ client, isRetry: true, project, secret });
    }

    // Secrets are read optimistically, so ignore persistent errors
  }
}
