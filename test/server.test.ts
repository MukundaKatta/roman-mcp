import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { toRoman, fromRoman } from '../src/server.js';

test('to_roman basics', () => {
  assert.equal(toRoman(1), 'I');
  assert.equal(toRoman(4), 'IV');
  assert.equal(toRoman(9), 'IX');
  assert.equal(toRoman(40), 'XL');
  assert.equal(toRoman(90), 'XC');
  assert.equal(toRoman(400), 'CD');
  assert.equal(toRoman(900), 'CM');
});

test('to_roman canonical samples', () => {
  assert.equal(toRoman(1994), 'MCMXCIV');
  assert.equal(toRoman(3999), 'MMMCMXCIX');
  assert.equal(toRoman(2024), 'MMXXIV');
});

test('to_roman rejects out of range', () => {
  assert.throws(() => toRoman(0));
  assert.throws(() => toRoman(4000));
  assert.throws(() => toRoman(-5));
  assert.throws(() => toRoman(1.5));
});

test('from_roman parses canonical', () => {
  assert.equal(fromRoman('MCMXCIV'), 1994);
  assert.equal(fromRoman('MMMCMXCIX'), 3999);
  assert.equal(fromRoman('IV'), 4);
});

test('from_roman is case-insensitive', () => {
  assert.equal(fromRoman('mcmxciv'), 1994);
});

test('from_roman trims surrounding whitespace', () => {
  assert.equal(fromRoman('  IV  '), 4);
  assert.equal(fromRoman('\tMCMXCIV\n'), 1994);
});

test('from_roman rejects non-string input', () => {
  // @ts-expect-error testing runtime guard against bad input
  assert.throws(() => fromRoman(undefined), /string/);
  // @ts-expect-error testing runtime guard against bad input
  assert.throws(() => fromRoman(123), /string/);
});

test('from_roman rejects malformed', () => {
  assert.throws(() => fromRoman('IIII'));
  assert.throws(() => fromRoman('VV'));
  assert.throws(() => fromRoman('IC'));
  assert.throws(() => fromRoman(''));
  assert.throws(() => fromRoman('XYZ'));
});

test('round trip 1..1000', () => {
  for (let n = 1; n <= 1000; n++) {
    assert.equal(fromRoman(toRoman(n)), n);
  }
});
