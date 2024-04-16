'use strict';

const { assert } = require('chai');
const sinon = require('sinon');

const { GCP_PROJECT } = process.env;
const buildConfig = require('../src/build-config');

suite('read-value:', () => {
  suite('retry:', () => {
    let mockClient, mockError;
    setup(() => {
      mockClient = {
        accessSecretVersion: sinon.stub(),
      };
      mockError = new Error();
    });

    test('read-value is retried when error is due to timeout', async () => {
      mockError.code = 4;
      mockClient.accessSecretVersion.callsFake(() => Promise.reject(mockError));

      await buildConfig({
        client: mockClient,
        project: GCP_PROJECT,
        schema: {
          secret: 'TEST',
        },
      }).catch(() => {});

      assert.equal(mockClient.accessSecretVersion.callCount, 2);
    });

    test('read-value is not retried when secret not found', async () => {
      mockError.code = 5;
      mockClient.accessSecretVersion.callsFake(() => Promise.reject(mockError));

      await buildConfig({
        client: mockClient,
        project: GCP_PROJECT,
        schema: {
          secret: 'TEST',
        },
      }).catch(() => {});

      assert.equal(mockClient.accessSecretVersion.callCount, 1);
    });

    test('read-value is not retried when secret is disabled', async () => {
      mockError.code = 9;
      mockClient.accessSecretVersion.callsFake(() => Promise.reject(mockError));

      await buildConfig({
        client: mockClient,
        project: GCP_PROJECT,
        schema: {
          secret: 'TEST',
        },
      }).catch(() => {});

      assert.equal(mockClient.accessSecretVersion.callCount, 1);
    });

    test('read-value is not retried when error is invalid argument', async () => {
      mockError.code = 3;
      mockClient.accessSecretVersion.callsFake(() => Promise.reject(mockError));

      await buildConfig({
        client: mockClient,
        project: GCP_PROJECT,
        schema: {
          secret: 'TEST',
        },
      }).catch(() => {});

      assert.equal(mockClient.accessSecretVersion.callCount, 1);
    });
  });

  suite('exceptions:', () => {
    let mockClient, mockError;
    setup(() => {
      mockClient = {
        accessSecretVersion: sinon.stub(),
      };
      mockError = new Error();
    });

    test('read-value fails when error is due to timeout', async () => {
      let error;
      mockError.code = 4;
      mockClient.accessSecretVersion.callsFake(() => Promise.reject(mockError));

      try {
        await buildConfig({
          client: mockClient,
          project: GCP_PROJECT,
          schema: {
            secret: 'TEST',
          },
        });
      } catch (e) {
        error = e;
      }

      assert.equal(mockClient.accessSecretVersion.callCount, 2);
      assert.deepEqual(error, mockError);
    });

    test('read-value fails when secret is disabled', async () => {
      let error;
      mockError.code = 9;
      mockClient.accessSecretVersion.callsFake(() => Promise.reject(mockError));

      try {
        await buildConfig({
          client: mockClient,
          project: GCP_PROJECT,
          schema: {
            secret: 'TEST',
          },
        });
      } catch (e) {
        error = e;
      }

      assert.equal(mockClient.accessSecretVersion.callCount, 1);
      assert.deepEqual(error, mockError);
    });

    test('read-value does not fail when error is due to not found', async () => {
      let error;
      mockError.code = 5;
      mockClient.accessSecretVersion.callsFake(() => Promise.reject(mockError));

      try {
        await buildConfig({
          client: mockClient,
          project: GCP_PROJECT,
          schema: {
            secret: 'TEST',
          },
        });
      } catch (e) {
        error = e;
      }

      assert.equal(mockClient.accessSecretVersion.callCount, 1);
      assert.isUndefined(error);
    });

    test('read-value does not try to fetch secret from GCP for schema.env', async () => {
      await buildConfig({
        client: mockClient,
        project: GCP_PROJECT,
        schema: {
          env: 'TEST',
        },
      });

      assert.equal(mockClient.accessSecretVersion.callCount, 0);
    });
  });

  suite('non-string schema keys', () => {
    let mockClient;
    setup(() => {
      mockClient = {
        accessSecretVersion: sinon.stub(),
      };
    });

    test('read-value does not try to fetch secret from GCP when schema.secret is not a string', async () => {
      await buildConfig({
        client: mockClient,
        project: GCP_PROJECT,
        schema: {
          email: {
            secret: {
              default: 'super-private',
              doc: 'Crypto secret for email auth tokens',
            },
          },
        },
      });

      assert.equal(mockClient.accessSecretVersion.callCount, 0);
    });
  });

  suite('version:', () => {
    let mockClient;
    setup(() => {
      mockClient = {
        accessSecretVersion: sinon.stub(),
      };
    });

    test('read-value uses specific version when "version" is present in the schema', async () => {
      mockClient.accessSecretVersion.callsFake(() =>
        Promise.resolve([{ payload: { data: 'value' } }]),
      );

      const version = 1;
      const secret = 'foo';

      await buildConfig({
        client: mockClient,
        project: GCP_PROJECT,
        schema: {
          version,
          secret,
        },
      });

      assert.equal(mockClient.accessSecretVersion.callCount, 1);
      assert(
        mockClient.accessSecretVersion.calledWithMatch({
          name: `projects/${GCP_PROJECT}/secrets/${secret}/versions/${version}`,
        }),
      );
    });

    test('read-value uses latest version when "version" is not present in the schema', async () => {
      mockClient.accessSecretVersion.callsFake(() =>
        Promise.resolve([{ payload: { data: 'value' } }]),
      );
      const secret = 'foo';

      await buildConfig({
        client: mockClient,
        project: GCP_PROJECT,
        schema: {
          secret,
        },
      });

      assert.equal(mockClient.accessSecretVersion.callCount, 1);
      assert(
        mockClient.accessSecretVersion.calledWithMatch({
          name: `projects/${GCP_PROJECT}/secrets/${secret}/versions/latest`,
        }),
      );
    });
  });
});
