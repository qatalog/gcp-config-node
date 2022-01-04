'use strict';

module.exports = readValue;

async function readValue({
  client,
  file,
  ignoreSecrets,
  prefix,
  project,
  schema,
}) {
  const { env } = schema;

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
  } catch (_) {
    if (!isRetry) {
      // Retry once to mitigate intermittent network failure
      return readSecret({ client, isRetry: true, project, secret });
    }

    // Secrets are read optimistically, so ignore persistent errors
  }
}
