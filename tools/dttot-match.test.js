// Run: node --test tools/dttot-match.test.js
const test = require('node:test');
const assert = require('node:assert');
const { dttotRowMatches } = require('../dttot-match');

const faiz = { name: 'FAIZ', aliases: '' };
const mira = { name: 'MIRA ARIANI', aliases: 'UMM ZAHRA' };
const john = { name: 'JOHN CARDONA', aliases: 'JOHN, JOE' };
const alQaeda = { name: 'AL-QAIDA', aliases: 'AL QAEDA' };

test('listed names match as whole words, any order, any case', () => {
  assert.ok(dttotRowMatches('Mira Ariani', mira));
  assert.ok(dttotRowMatches('ariani mira', mira));
  assert.ok(dttotRowMatches('Mira Ariani Binti Ahmad', mira));
  assert.ok(dttotRowMatches('Umm Zahra', mira));
  assert.ok(dttotRowMatches('Faiz Ramadhan', faiz));
  assert.ok(dttotRowMatches('al qaida', alQaeda));
  assert.ok(dttotRowMatches('Fáiz', faiz));
});

test('partial words and partial names do not match', () => {
  assert.ok(!dttotRowMatches('Faizal Ramadhan', faiz));
  assert.ok(!dttotRowMatches('Mira Lestari', mira));
  assert.ok(!dttotRowMatches('Zahra Putri', mira));
  assert.ok(!dttotRowMatches('', mira));
});

test('one-word aliases only match an exact one-word name', () => {
  assert.ok(!dttotRowMatches('John Smith', john));
  assert.ok(dttotRowMatches('John', john));
  assert.ok(dttotRowMatches('John Cardona', john));
});
