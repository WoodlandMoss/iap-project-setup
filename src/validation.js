const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(dueDate) {
  return typeof dueDate === 'string' && DATE_RE.test(dueDate);
}

function validateAssignmentInput({ title, dueDate } = {}) {
  if (!title) {
    return { ok: false, error: 'title and a valid dueDate (YYYY-MM-DD) are required' };
  }
  if (!dueDate || !isValidDate(dueDate)) {
    return { ok: false, error: 'title and a valid dueDate (YYYY-MM-DD) are required' };
  }
  return { ok: true };
}

module.exports = { isValidDate, validateAssignmentInput };
