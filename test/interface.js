'use strict';

const { assert } = require('chai');

const { GCP_PROJECT } = process.env;

suite('interface:', () => {
  let impl;

  suiteSetup(() => {
    impl = require('../src');
  });

  test('GCP_PROJECT environment variable is set', () => {
    assert.isString(GCP_PROJECT);
    assert.notEqual(GCP_PROJECT, '');
  });

  test('interface looks correct', () => {
    assert.lengthOf(Object.keys(impl), 1);
    assert.isFunction(impl.load);
    assert.lengthOf(impl.load, 1);
  });

  test('load fails if project is invalid', async () => {
    let failed = false;

    try {
      await impl.load({
        project: '',
        schema: {
          foo: {
            default: 'foo',
            env: 'FOO',
          },
        },
      });
    } catch (_) {
      failed = true;
    }

    assert.isTrue(failed);
  });

  test('load fails if schema is invalid', async () => {
    let failed = false;

    try {
      await impl.load({
        project: GCP_PROJECT,
        schema: {},
      });
    } catch (_) {
      failed = true;
    }

    assert.isTrue(failed);
  });

  test('load does not fail with valid project and schema', async () => {
    let failed = false;

    try {
      await impl.load({
        project: GCP_PROJECT,
        schema: {
          foo: {
            default: 'foo',
            env: 'FOO',
          },
        },
      });
    } catch (_) {
      failed = true;
    }

    assert.isFalse(failed);
  });

  test('load fails if prefix is invalid', async () => {
    let failed = false;

    try {
      await impl.load({
        prefix: '',
        project: GCP_PROJECT,
        schema: {
          foo: {
            default: 'foo',
            env: 'FOO',
          },
        },
      });
    } catch (_) {
      failed = true;
    }

    assert.isTrue(failed);
  });

  test('load fails if file is invalid', async () => {
    let failed = false;

    try {
      await impl.load({
        file: '',
        project: GCP_PROJECT,
        schema: {
          foo: {
            default: 'foo',
            env: 'FOO',
          },
        },
      });
    } catch (_) {
      failed = true;
    }

    assert.isTrue(failed);
  });
});
