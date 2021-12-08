'use strict';

const { assert } = require('chai');
const joi = require('joi');

const { GCP_PROJECT } = process.env;

const SCHEMA = {
  foo: {
    default: 'wibble',
    env: 'FOO',
    schema: joi.string(),
  },
  bar: {
    default: 42,
    env: 'BAR',
    schema: joi.number().positive(),
  },
  baz: {
    coerce: {
      from: 'duration',
      to: 'milliseconds',
    },
    default: 'PT5S',
    env: 'BAZ',
    schema: joi.string().isoDuration(),
  },
};

suite('validation:', () => {
  let config, impl;

  suiteSetup(() => {
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
        foo: 'wibble',
        bar: 42,
        baz: 5000,
      });
    });
  });

  suite('load environment variables:', () => {
    suiteSetup(async () => {
      process.env.FOO = 'foo set from environment';
      process.env.BAR = '1977';
      process.env.BAZ = 'P1D';
      config = await impl.load({
        project: GCP_PROJECT,
        schema: SCHEMA,
      });
    });

    suiteTeardown(() => {
      delete process.env.FOO;
      delete process.env.BAR;
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        foo: 'foo set from environment',
        bar: 1977,
        baz: 86400000,
      });
    });
  });

  suite('load invalid value:', () => {
    let error;

    suiteSetup(async () => {
      process.env.FOO = 'foo set from environment';
      process.env.BAR = 'bar set from environment';
      try {
        config = await impl.load({
          project: GCP_PROJECT,
          schema: SCHEMA,
        });
      } catch (e) {
        error = e;
      }
    });

    suiteTeardown(() => {
      delete process.env.FOO;
      delete process.env.BAR;
    });

    test('failed', () => {
      assert.instanceOf(error, Error);
    });
  });

  suite('load missing required value:', () => {
    let error, schema;

    suiteSetup(async () => {
      schema = {
        ...SCHEMA,
        foo: {
          env: 'FOO',
          required: true,
          schema: joi.string(),
        },
      };
      try {
        config = await impl.load({
          project: GCP_PROJECT,
          schema,
        });
      } catch (e) {
        error = e;
      }
    });

    test('failed', () => {
      assert.instanceOf(error, Error);
      assert.equal(error.message, '`foo` is required');
    });
  });

  suite('load missing required value (nested):', () => {
    let error, schema;

    suiteSetup(async () => {
      schema = {
        ...SCHEMA,
        wibble: {
          blee: {
            env: 'WIBBLE_BLEE',
            required: true,
            schema: joi.string(),
          },
        },
      };
      try {
        config = await impl.load({
          project: GCP_PROJECT,
          schema,
        });
      } catch (e) {
        error = e;
      }
    });

    test('error message was correct', () => {
      assert.equal(error.message, '`wibble.blee` is required');
    });
  });
});
