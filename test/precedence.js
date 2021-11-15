'use strict';

const path = require('path');

const { assert } = require('chai');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const { GCP_PROJECT } = process.env;

const DEFAULTS = {
  foo: 'foo default value',
  bar: 'value bar',
  blee: 'value blee',
};

const ENV = {
  foo: 'FOO',
  bar: 'BAR_BAR',
  wibble: 'QUX_WIBBLE',
};

const SECRETS = {
  foo: `foo_${randomString()}`,
  baz: `BAZ_${randomString()}`,
  blee: `bLeE_${randomString()}`,
};

const SCHEMA = {
  foo: {
    default: DEFAULTS.foo,
    env: ENV.foo,
    secret: SECRETS.foo,
  },
  bar: {
    default: DEFAULTS.bar,
    env: ENV.bar,
  },
  baz: {
    secret: SECRETS.baz,
  },
  qux: {
    wibble: {
      env: ENV.wibble,
    },
    blee: {
      default: DEFAULTS.blee,
      secret: SECRETS.blee,
    },
  },
};

suite('precedence:', () => {
  let client, config, impl;

  suiteSetup(() => {
    client = new SecretManagerServiceClient();
    impl = require('../src');
  });

  suite('load defaults:', () => {
    suiteSetup(async () => {
      config = await impl.load({
        project: GCP_PROJECT,
        schema: SCHEMA,
      });
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        foo: DEFAULTS.foo,
        bar: DEFAULTS.bar,
        qux: {
          blee: DEFAULTS.blee,
        },
      });
    });
  });

  suite('load environment variables:', () => {
    suiteSetup(async () => {
      process.env[ENV.foo] = 'foo set from environment';
      process.env[ENV.bar] = 'bar set from environment';
      process.env[ENV.wibble] = 'wibble set from environment';
      config = await impl.load({
        project: GCP_PROJECT,
        schema: SCHEMA,
      });
    });

    suiteTeardown(() => {
      delete process.env[ENV.foo];
      delete process.env[ENV.bar];
      delete process.env[ENV.wibble];
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        foo: 'foo set from environment',
        bar: 'bar set from environment',
        qux: {
          wibble: 'wibble set from environment',
          blee: DEFAULTS.blee,
        },
      });
    });

    suite('load secrets and environment variables:', () => {
      let secrets;

      suiteSetup(async () => {
        secrets = await setupSecrets(client);
        config = await impl.load({
          project: GCP_PROJECT,
          schema: SCHEMA,
        });
      });

      suiteTeardown(async () => {
        await teardownSecrets(client, secrets);
      });

      test('result was correct', () => {
        assert.deepEqual(config, {
          foo: 'foo set from environment',
          bar: 'bar set from environment',
          baz: `${SECRETS.baz} set from gcp`,
          qux: {
            wibble: 'wibble set from environment',
            blee: `${SECRETS.blee} set from gcp`,
          },
        });
      });
    });
  });

  suite('load secrets:', () => {
    let secrets;

    suiteSetup(async () => {
      secrets = await setupSecrets(client);
      config = await impl.load({
        project: GCP_PROJECT,
        schema: SCHEMA,
      });
    });

    suiteTeardown(async () => {
      await teardownSecrets(client, secrets);
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        foo: `${SECRETS.foo} set from gcp`,
        bar: DEFAULTS.bar,
        baz: `${SECRETS.baz} set from gcp`,
        qux: {
          blee: `${SECRETS.blee} set from gcp`,
        },
      });
    });

    suite('load file and secrets:', () => {
      suiteSetup(async () => {
        config = await impl.load({
          file: path.join(__dirname, 'precedence.json'),
          project: GCP_PROJECT,
          schema: SCHEMA,
        });
      });

      test('result was correct', () => {
        assert.deepEqual(config, {
          foo: `${SECRETS.foo} set from gcp`,
          bar: DEFAULTS.bar,
          baz: `${SECRETS.baz} set from gcp`,
          qux: {
            wibble: 'wibble set from file',
            blee: `${SECRETS.blee} set from gcp`,
          },
        });
      });
    });
  });

  suite('load secrets with prefix:', () => {
    let prefix, secrets;

    suiteSetup(async () => {
      prefix = 'TEST_';
      secrets = await setupSecrets(client, prefix);
      config = await impl.load({
        prefix,
        project: GCP_PROJECT,
        schema: SCHEMA,
      });
    });

    suiteTeardown(async () => {
      await teardownSecrets(client, secrets);
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        foo: `${prefix}${SECRETS.foo} set from gcp`,
        bar: DEFAULTS.bar,
        baz: `${prefix}${SECRETS.baz} set from gcp`,
        qux: {
          blee: `${prefix}${SECRETS.blee} set from gcp`,
        },
      });
    });
  });

  suite('load file:', () => {
    let file;

    suiteSetup(async () => {
      config = await impl.load({
        file: path.join(__dirname, 'precedence.json'),
        project: GCP_PROJECT,
        schema: SCHEMA,
      });
      file = require('./precedence.json');
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        ...file,
        bar: DEFAULTS.bar,
      });
    });
  });
});

function randomString() {
  return Math.random().toString(36).slice(2);
}

async function setupSecrets(client, prefix = '') {
  const results = await Promise.all([
    client.createSecret({
      parent: `projects/${GCP_PROJECT}`,
      secret: { replication: { automatic: {} } },
      secretId: `${prefix}${SECRETS.foo}`,
    }),
    client.createSecret({
      parent: `projects/${GCP_PROJECT}`,
      secret: { replication: { automatic: {} } },
      secretId: `${prefix}${SECRETS.baz}`,
    }),
    client.createSecret({
      parent: `projects/${GCP_PROJECT}`,
      secret: { replication: { automatic: {} } },
      secretId: `${prefix}${SECRETS.blee}`,
    }),
  ]);
  const secrets = results.map((r) => r[0].name);
  await Promise.all(
    secrets.map((secret) =>
      client.addSecretVersion({
        parent: secret,
        payload: {
          data: Buffer.from(`${secret.split('/').pop()} set from gcp`, 'utf8'),
        },
      }),
    ),
  );
  return secrets;
}

async function teardownSecrets(client, secrets) {
  await Promise.all(secrets.map((name) => client.deleteSecret({ name })));
}
