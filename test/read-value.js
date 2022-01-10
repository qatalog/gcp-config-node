'use strict';

const { assert } = require('chai');
const sinon = require('sinon');

const { GCP_PROJECT } = process.env;
const buildConfig = require('../src/build-config');

suite('read-value:', () => {
  suite('retry:', () => {
    let mockClient;
    setup(() => {
      mockClient = {
        accessSecretVersion: sinon.stub(),
        getSecretVersion: sinon.stub(),
      };
    });

    test('read-value is retried when error is due to timeout', async () => {
      mockClient.getSecretVersion.callsFake(() => Promise.reject({ code: 4 }));

      await buildConfig({
        client: mockClient,
        project: GCP_PROJECT,
        schema: {
          env: 'TEST',
        },
      });

      assert.equal(mockClient.getSecretVersion.callCount, 2);
    });

    test('read-value is not retried when secret not found', async () => {
      mockClient.getSecretVersion.callsFake(() => Promise.reject({ code: 5 }));

      await buildConfig({
        client: mockClient,
        project: GCP_PROJECT,
        schema: {
          env: 'TEST',
        },
      });

      assert.equal(mockClient.getSecretVersion.callCount, 1);
    });

    test('read-value is not retried when error is invalid argument', async () => {
      mockClient.getSecretVersion.callsFake(() => Promise.reject({ code: 5 }));

      await buildConfig({
        client: mockClient,
        project: GCP_PROJECT,
        schema: {
          env: 'TEST',
        },
      });

      assert.equal(mockClient.getSecretVersion.callCount, 1);
    });
  });
});
