'use strict';

const path = require('path');

const { assert } = require('chai');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const { GCP_PROJECT } = process.env;

const ENV_VARS = {
  foo: 'FOO',
  bar: 'BAR_BAR',
  wibble: 'QUX_WIBBLE',
};

suite('precedence:', () => {
  let client, config, defaults, impl, schema, secretKeys;

  suiteSetup(() => {
    client = new SecretManagerServiceClient();
    impl = require('../src');
  });

  setup(() => {
    defaults = {
      foo: randomString(),
      bar: randomString(),
      blee: randomString(),
    };
    secretKeys = {
      foo: `foo_${randomString()}`,
      baz: `BAZ_${randomString()}`,
      blee: `bLeE_${randomString()}`,
    };
    schema = {
      foo: {
        default: defaults.foo,
        env: ENV_VARS.foo,
        secret: secretKeys.foo,
      },
      bar: {
        default: defaults.bar,
        env: ENV_VARS.bar,
      },
      baz: {
        secret: secretKeys.baz,
      },
      qux: {
        wibble: {
          env: ENV_VARS.wibble,
        },
        blee: {
          default: defaults.blee,
          secret: secretKeys.blee,
        },
      },
    };
  });

  suite('load nothing:', () => {
    setup(async () => {
      delete schema.foo.default;
      delete schema.bar.default;
      delete schema.qux.blee.default;
      config = await impl.load({
        project: GCP_PROJECT,
        schema,
      });
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        qux: {},
      });
    });
  });

  suite('load defaults:', () => {
    setup(async () => {
      config = await impl.load({
        project: GCP_PROJECT,
        schema,
      });
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        foo: defaults.foo,
        bar: defaults.bar,
        qux: {
          blee: defaults.blee,
        },
      });
    });
  });

  suite('load environment variables:', () => {
    setup(async () => {
      process.env[ENV_VARS.foo] = 'foo set from environment';
      process.env[ENV_VARS.bar] = 'bar set from environment';
      process.env[ENV_VARS.wibble] = 'wibble set from environment';
      config = await impl.load({
        project: GCP_PROJECT,
        schema,
      });
    });

    teardown(() => {
      delete process.env[ENV_VARS.foo];
      delete process.env[ENV_VARS.bar];
      delete process.env[ENV_VARS.wibble];
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        foo: 'foo set from environment',
        bar: 'bar set from environment',
        qux: {
          wibble: 'wibble set from environment',
          blee: defaults.blee,
        },
      });
    });

    suite('load secrets and environment variables:', () => {
      let secrets;

      setup(async () => {
        secrets = await setupSecrets(client, secretKeys);
        config = await impl.load({
          project: GCP_PROJECT,
          schema,
        });
      });

      teardown(async () => {
        await teardownSecrets(client, secrets);
      });

      test('result was correct', () => {
        assert.deepEqual(config, {
          foo: 'foo set from environment',
          bar: 'bar set from environment',
          baz: `${secretKeys.baz} set from gcp`,
          qux: {
            wibble: 'wibble set from environment',
            blee: `${secretKeys.blee} set from gcp`,
          },
        });
      });
    });
  });

  suite('load secrets:', () => {
    let secrets;

    setup(async () => {
      secrets = await setupSecrets(client, secretKeys);
      config = await impl.load({
        project: GCP_PROJECT,
        schema,
      });
    });

    teardown(async () => {
      await teardownSecrets(client, secrets);
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        foo: `${secretKeys.foo} set from gcp`,
        bar: defaults.bar,
        baz: `${secretKeys.baz} set from gcp`,
        qux: {
          blee: `${secretKeys.blee} set from gcp`,
        },
      });
    });

    suite('load file and secrets:', () => {
      setup(async () => {
        config = await impl.load({
          file: path.join(__dirname, 'precedence.json'),
          project: GCP_PROJECT,
          schema,
        });
      });

      test('result was correct', () => {
        assert.deepEqual(config, {
          foo: `${secretKeys.foo} set from gcp`,
          bar: defaults.bar,
          baz: `${secretKeys.baz} set from gcp`,
          qux: {
            wibble: 'wibble set from file',
            blee: `${secretKeys.blee} set from gcp`,
          },
        });
      });
    });
  });

  suite('load secrets with prefix:', () => {
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
          blee: `${prefix}${secretKeys.blee} set from gcp`,
        },
      });
    });
  });

  suite('ignore secrets:', () => {
    let secrets;

    setup(async () => {
      process.env[ENV_VARS.foo] = 'foo set from environment';
      secrets = await setupSecrets(client, secretKeys);
      config = await impl.load({
        ignoreSecrets: true,
        project: GCP_PROJECT,
        schema,
      });
    });

    teardown(async () => {
      await teardownSecrets(client, secrets);
      delete process.env[ENV_VARS.foo];
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        foo: 'foo set from environment',
        bar: defaults.bar,
        qux: {
          blee: defaults.blee,
        },
      });
    });
  });

  suite('load file:', () => {
    let file;

    setup(async () => {
      config = await impl.load({
        file: path.join(__dirname, 'precedence.json'),
        project: GCP_PROJECT,
        schema,
      });
      file = require('./precedence.json');
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        ...file,
        bar: defaults.bar,
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
      secretId: `${prefix}${secretKeys.blee}`,
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
