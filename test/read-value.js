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
        getSecretVersion: sinon.stub(),
      };
      mockError = new Error();
    });

    test('read-value is retried when error is due to timeout', async () => {
      mockError.code = 4;
      mockClient.getSecretVersion.callsFake(() => Promise.reject(mockError));

      await buildConfig({
        client: mockClient,
        project: GCP_PROJECT,
        schema: {
          env: 'TEST',
        },
      }).catch(() => {});

      assert.equal(mockClient.getSecretVersion.callCount, 2);
    });

    test('read-value is not retried when secret not found', async () => {
      mockError.code = 5;
      mockClient.getSecretVersion.callsFake(() => Promise.reject(mockError));

      await buildConfig({
        client: mockClient,
        project: GCP_PROJECT,
        schema: {
          env: 'TEST',
        },
      }).catch(() => {});

      assert.equal(mockClient.getSecretVersion.callCount, 1);
    });

    test('read-value is not retried when error is invalid argument', async () => {
      mockError.code = 3;
      mockClient.getSecretVersion.callsFake(() => Promise.reject(mockError));

      await buildConfig({
        client: mockClient,
        project: GCP_PROJECT,
        schema: {
          env: 'TEST',
        },
      }).catch(() => {});

      assert.equal(mockClient.getSecretVersion.callCount, 1);
    });
  });

  suite('exceptions:', () => {
    let mockClient, mockError;
    setup(() => {
      mockClient = {
        accessSecretVersion: sinon.stub(),
        getSecretVersion: sinon.stub(),
      };
      mockError = new Error();
    });

    test('read-value fails when error is due to timeout', async () => {
      let error;
      mockError.code = 4;
      mockClient.getSecretVersion.callsFake(() => Promise.reject(mockError));

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

      assert.equal(mockClient.getSecretVersion.callCount, 2);
      assert.deepEqual(error, mockError);
    });

    test('read-value does not fail when error is due to not found', async () => {
      let error;
      mockError.code = 5;
      mockClient.getSecretVersion.callsFake(() => Promise.reject(mockError));

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

      assert.equal(mockClient.getSecretVersion.callCount, 1);
      assert.isUndefined(error);
    });
  });
});
