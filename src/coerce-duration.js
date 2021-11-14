'use strict';

// https://regex101.com/r/kqtUp4/1
const DURATION_REGEX =
  /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?(?:T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?)?/;

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
// XXX: Callers beware that MONTH and YEAR are not precise
const MONTH = DAY * 30;
const YEAR = DAY * 365;

const DURATION_PARTS = [YEAR, MONTH, WEEK, DAY, HOUR, MINUTE, SECOND];

module.exports = {
  milliseconds,
  seconds,
};

function milliseconds(duration) {
  const matches = DURATION_REGEX.exec(duration);

  if (!matches) {
    throw new Error('Invalid duration');
  }

  const [, sign, ...parts] = matches;

  const absoluteValue = parts.reduce((result, part, index) => {
    if (part) {
      return result + parseFloat(part) * DURATION_PARTS[index];
    }
    return result;
  }, 0);

  if (sign === '-') {
    return -absoluteValue;
  }

  return absoluteValue;
}

function seconds(duration) {
  return Math.round(milliseconds(duration) / 1000);
}
