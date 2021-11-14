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
      });
    });
  });

  suite('load environment variables:', () => {
    suiteSetup(async () => {
      process.env.FOO = 'foo set from environment';
      process.env.BAR = '1977';
      config = await impl.load({
        project: GCP_PROJECT,
        schema: SCHEMA,
      });
    });

    suiteTeardown(() => {
      delete process.env.FOO
      delete process.env.BAR
    });

    test('result was correct', () => {
      assert.deepEqual(config, {
        foo: 'foo set from environment',
        bar: 1977,
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
      delete process.env.FOO
      delete process.env.BAR
    });

    test('failed', () => {
      assert.instanceOf(error, Error);
    });
  });
});
