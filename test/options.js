'use strict';

const path = require('path');

const { assert } = require('chai');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const { GCP_PROJECT } = process.env;

suite('options:', () => {
  let client, config, defaults, impl, schema, secretKeys;

  suiteSetup(() => {
    client = new SecretManagerServiceClient();
    impl = require('../src');
  });

  setup(() => {
    defaults = {
      foo: randomString(),
      bar: randomString(),
      wibble: randomString(),
      blee: [randomString(), randomString()],
    };
    secretKeys = {
      foo: `foo_${randomString()}`,
      baz: `BAZ_${randomString()}`,
      wibble: `WiBbLe_${randomString()}`,
    };
    schema = {
      foo: {
        default: defaults.foo,
        env: 'FOO',
        secret: secretKeys.foo,
      },
      bar: {
        default: defaults.bar,
      },
      baz: {
        secret: secretKeys.baz,
      },
      qux: {
        wibble: {
          default: defaults.wibble,
          secret: secretKeys.wibble,
        },
        blee: {
          default: defaults.blee,
        },
        array: [
          { default: defaults.foo, secret: `array_0_${secretKeys.foo}` },
          { default: defaults.bar, secret: `array_1_${secretKeys.foo}` },
        ],
      },
    };
  });

  suite('file:', () => {
    let file;

    setup(async () => {
      config = await impl.load({
        file: path.join(__dirname, 'file.json'),
        project: GCP_PROJECT,
        schema,
      });
      file = require('./file.json');
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        ...file,
        bar: defaults.bar,
      });
    });
  });

  suite('ignoreSecrets:', () => {
    let secrets;

    setup(async () => {
      process.env.FOO = 'foo set from environment';
      secrets = await setupSecrets(client, secretKeys);
      config = await impl.load({
        ignoreSecrets: true,
        project: GCP_PROJECT,
        schema,
      });
    });

    teardown(async () => {
      await teardownSecrets(client, secrets);
      delete process.env.FOO;
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        foo: 'foo set from environment',
        bar: defaults.bar,
        qux: {
          wibble: defaults.wibble,
          blee: defaults.blee,
          array: [defaults.foo, defaults.bar],
        },
      });
    });
  });

  suite('prefix:', () => {
    let prefix, secrets;

    setup(async () => {
      prefix = 'TEST_';
      secrets = await setupSecrets(client, secretKeys, prefix);
      config = await impl.load({
        prefix,
        project: GCP_PROJECT,
        schema,
      });
    });

    teardown(async () => {
      await teardownSecrets(client, secrets);
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        foo: `${prefix}${secretKeys.foo} set from gcp`,
        bar: defaults.bar,
        baz: `${prefix}${secretKeys.baz} set from gcp`,
        qux: {
          wibble: `${prefix}${secretKeys.wibble} set from gcp`,
          blee: defaults.blee,
          array: [
            `${prefix}array_0_${secretKeys.foo} set from gcp`,
            `${prefix}array_1_${secretKeys.foo} set from gcp`,
          ],
        },
      });
    });
  });
});

function randomString() {
  return Math.random().toString(36).slice(2);
}

async function setupSecrets(client, secretKeys, prefix = '') {
  const results = await Promise.all([
    client.createSecret({
      parent: `projects/${GCP_PROJECT}`,
      secret: { replication: { automatic: {} } },
      secretId: `${prefix}${secretKeys.foo}`,
    }),
    client.createSecret({
      parent: `projects/${GCP_PROJECT}`,
      secret: { replication: { automatic: {} } },
      secretId: `${prefix}${secretKeys.baz}`,
    }),
    client.createSecret({
      parent: `projects/${GCP_PROJECT}`,
      secret: { replication: { automatic: {} } },
      secretId: `${prefix}${secretKeys.wibble}`,
    }),
    client.createSecret({
      parent: `projects/${GCP_PROJECT}`,
      secret: { replication: { automatic: {} } },
      secretId: `${prefix}array_0_${secretKeys.foo}`,
    }),
    client.createSecret({
      parent: `projects/${GCP_PROJECT}`,
      secret: { replication: { automatic: {} } },
      secretId: `${prefix}array_1_${secretKeys.foo}`,
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
