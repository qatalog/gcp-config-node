'use strict';

const { assert } = require('chai');

suite('coerce-duration:', () => {
  let duration;

  suiteSetup(() => {
    duration = require('../src/coerce-duration');
  });

  test('PT1S to milliseconds', () => {
    assert.equal(duration.milliseconds('PT1S'), 1000);
  });

  test('PT1S to seconds', () => {
    assert.equal(duration.seconds('PT1S'), 1);
  });

  test('PT1M to milliseconds', () => {
    assert.equal(duration.milliseconds('PT1M'), 60000);
  });

  test('PT1M to seconds', () => {
    assert.equal(duration.seconds('PT1M'), 60);
  });

  test('PT1H to milliseconds', () => {
    assert.equal(duration.milliseconds('PT1H'), 3600000);
  });

  test('PT1H to seconds', () => {
    assert.equal(duration.seconds('PT1H'), 3600);
  });

  test('P1D to milliseconds', () => {
    assert.equal(duration.milliseconds('P1D'), 86400000);
  });

  test('P1D to seconds', () => {
    assert.equal(duration.seconds('P1D'), 86400);
  });

  test('P1W to milliseconds', () => {
    assert.equal(duration.milliseconds('P1W'), 604800000);
  });

  test('P1W to seconds', () => {
    assert.equal(duration.seconds('P1W'), 604800);
  });

  test('P1M to milliseconds', () => {
    assert.equal(duration.milliseconds('P1M'), 2592000000);
  });

  test('P1M to seconds', () => {
    assert.equal(duration.seconds('P1M'), 2592000);
  });

  test('P1Y to milliseconds', () => {
    assert.equal(duration.milliseconds('P1Y'), 31536000000);
  });

  test('P1Y to seconds', () => {
    assert.equal(duration.seconds('P1Y'), 31536000);
  });

  test('PT2S to milliseconds', () => {
    assert.equal(duration.milliseconds('PT2S'), 2000);
  });

  test('PT2S to seconds', () => {
    assert.equal(duration.seconds('PT2S'), 2);
  });

  test('PT1.499S to milliseconds', () => {
    assert.equal(duration.milliseconds('PT1.499S'), 1499);
  });

  test('PT1.499S to seconds', () => {
    assert.equal(duration.seconds('PT1.499S'), 1);
  });

  test('PT1.5S to seconds', () => {
    assert.equal(duration.seconds('PT1.5S'), 2);
  });

  test('P1Y1M1W1DT1H1M1S to milliseconds', () => {
    assert.equal(duration.milliseconds('P1Y1M1W1DT1H1M1S'), 34822861000);
  });

  test('P1Y1M1W1DT1H1M1S', () => {
    assert.equal(duration.seconds('P1Y1M1W1DT1H1M1S'), 34822861);
  });

  test('-PT1S to milliseconds', () => {
    assert.equal(duration.milliseconds('-PT1S'), -1000);
  });

  test('-PT1S to seconds', () => {
    assert.equal(duration.seconds('-PT1S'), -1);
  });
});
