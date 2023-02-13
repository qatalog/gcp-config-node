'use strict';

module.exports = {
  array,
};

function array(string) {
  const parsed = JSON.parse(string);
  if (!Array.isArray(parsed)) {
    throw new Error('Invalid string');
  }

  return parsed;
}
