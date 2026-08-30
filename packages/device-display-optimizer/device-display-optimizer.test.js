'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const optimizer = require('./device-display-optimizer.js');

test('identifies Apple mobile devices without claiming an exact generation', () => {
  assert.deepEqual(
    optimizer.identify('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 'iPhone', ''),
    { manufacturer: 'Apple', model: 'iPhone', platform: 'iOS' },
  );
});

test('prefers an Android Client Hint model and identifies its manufacturer', () => {
  assert.deepEqual(
    optimizer.identify('Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36', 'Android', 'Pixel 9 Pro'),
    { manufacturer: 'Google', model: 'Pixel 9 Pro', platform: 'Android' },
  );
});

test('falls back safely when hardware details are unavailable', () => {
  assert.deepEqual(optimizer.identify('Mozilla/5.0 (X11; Linux x86_64)', 'Linux', ''), {
    manufacturer: 'Unknown', model: 'Unknown', platform: 'Linux',
  });
});
