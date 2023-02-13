'use strict';

const { assert } = require('chai');

suite('coerce-string:', () => {
  let string;

  suiteSetup(() => {
    string = require('../src/coerce-string');
  });

  test('[] to array', () => {
    assert.deepEqual(string.array('[]'), []);
  });

  test('["foo", "bar"] to array', () => {
    assert.deepEqual(string.array('["foo","bar"]'), ['foo', 'bar']);
  });

  test('{} to array', () => {
    assert.throws(() => string.array('{}'));
  });
});
