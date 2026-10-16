const test = require('node:test');
const assert = require('node:assert');
const { isValidDate, validateAssignmentInput } = require('../src/validation.js');

test('isValidDate accepts a well-formed ISO-8601 calendar date', () => {
  assert.strictEqual(isValidDate('2026-10-10'), true);
});

test('isValidDate rejects a slash-separated date', () => {
  assert.strictEqual(isValidDate('10/10/2026'), false);
});

test('isValidDate rejects a date missing leading zeros', () => {
  assert.strictEqual(isValidDate('2026-1-1'), false);
});

test('isValidDate rejects a non-date string', () => {
  assert.strictEqual(isValidDate('not-a-date'), false);
});

test('isValidDate rejects an empty string', () => {
  assert.strictEqual(isValidDate(''), false);
});

test('isValidDate rejects a non-string value', () => {
  assert.strictEqual(isValidDate(20261010), false);
});

test('validateAssignmentInput accepts a title and a valid dueDate', () => {
  const result = validateAssignmentInput({ title: 'Read chapter 3', dueDate: '2026-10-10' });
  assert.deepStrictEqual(result, { ok: true });
});

test('validateAssignmentInput rejects a missing title', () => {
  const result = validateAssignmentInput({ dueDate: '2026-10-10' });
  assert.strictEqual(result.ok, false);
});

test('validateAssignmentInput rejects an empty-string title', () => {
  const result = validateAssignmentInput({ title: '', dueDate: '2026-10-10' });
  assert.strictEqual(result.ok, false);
});

test('validateAssignmentInput rejects a missing dueDate', () => {
  const result = validateAssignmentInput({ title: 'Read chapter 3' });
  assert.strictEqual(result.ok, false);
});

test('validateAssignmentInput rejects a malformed dueDate', () => {
  const result = validateAssignmentInput({ title: 'Read chapter 3', dueDate: '10-10-2026' });
  assert.strictEqual(result.ok, false);
});

test('validateAssignmentInput does not require course', () => {
  const result = validateAssignmentInput({ title: 'Read chapter 3', dueDate: '2026-10-10' });
  assert.strictEqual(result.ok, true);
});
