const VALID_STATUSES = ['todo', 'in_progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

const validateCommonFields = (body) => {
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return `status must be one of: ${VALID_STATUSES.join(', ')}`;
  }
  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    return `priority must be one of: ${VALID_PRIORITIES.join(', ')}`;
  }
  if (body.dueDate && isNaN(Date.parse(body.dueDate))) {
    return 'dueDate must be a valid ISO date string';
  }
  return null;
};

const validateCreateTask = (body) => {
  // title is REQUIRED when creating a task
  if (typeof body.title !== 'string' ||body.title.trim() === '') {
    return 'title is required and must be a non-empty string';
  }
  return validateCommonFields(body);
};
const validateUpdateTask = (body) => {
  // title is OPTIONAL when updating
  if (body.title !== undefined &&(typeof body.title !== 'string' || body.title.trim() === '')) {
    return 'title must be a non-empty string';}
  return validateCommonFields(body);
};
// Validation for PATCH /tasks/:id/assign
const validateAssignTask = (body) => {
  if (!body ||typeof body !== 'object' ||Array.isArray(body)) {
    return 'request body must be a valid object';
  }
  if (typeof body.assignee !== 'string' ||body.assignee.trim() === '') {
    return 'assignee must be a non-empty string';
  }
  return null;
};

module.exports = { validateCreateTask, validateUpdateTask, validateAssignTask };