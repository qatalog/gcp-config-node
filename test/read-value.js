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
          env: 'TEST',
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
          env: 'TEST',
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
          env: 'TEST',
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
          env: 'TEST',
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
            env: 'TEST',
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
            env: 'TEST',
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
            env: 'TEST',
          },
        });
      } catch (e) {
        error = e;
      }

      assert.equal(mockClient.accessSecretVersion.callCount, 1);
      assert.isUndefined(error);
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

    test('read-value does not try to fetch secret from GCP when schema.env is not a string', async () => {
      await buildConfig({
        client: mockClient,
        project: GCP_PROJECT,
        schema: {
          email: {
            env: {
              default: 'interesting-env',
              doc: 'Environment to use in CI for tests',
            },
          },
        },
      });

      assert.equal(mockClient.accessSecretVersion.callCount, 0);
    });
  });
});
