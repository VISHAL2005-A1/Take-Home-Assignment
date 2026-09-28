# Bug Report

## 1. Bug Fix: Pagination skips the first page

**Location:** `src/services/taskService.js`

### Problem

`getPaginated(1, 10)` should return tasks 1–10, but it returned the 11th task onward.

The original code used `page * limit` as the offset:

```js
const offset = page * limit; // page 1 → offset 10 (skips the first 10 tasks)
```

Arrays are zero-indexed, so page 1 needs an offset of 0.

### How I Found It

A unit test with 11 tasks called `getPaginated(1, 10)`. It returned 1 task (the 11th) instead of 10.

### Fix

```js
const offset = (page - 1) * limit;
```

| Page | Offset | Tasks |
|------|--------|-------|
| 1    | 0      | 1–10  |
| 2    | 10     | 11–20 |
| 3    | 20     | 21–30 |

### Verification

```text
Test Suites: 2 passed, 2 total
Tests:       35 passed, 35 total
```

| Statements | Branches | Functions | Lines  |
|------------|----------|-----------|--------|
| 93.05%     |  82.66%      |  93.1%     | 92.42% |

---

## 2. New Feature: Assign Task

**Endpoint:** `PATCH /tasks/:id/assign`

**Request body:**

```json
{ "assignee": "Vishal" }
```

### Implementation

```js
router.patch('/:id/assign', (req, res) => {
  const error = validateAssignTask(req.body);
  if (error) return res.status(400).json({ error });

  const task = taskService.update(req.params.id, {
    assignee: req.body.assignee.trim(),
  });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  res.json(task);
});
```

### Behavior

- Returns `400` for a missing, empty, whitespace-only, or non-string `assignee`
- Returns `404` if the task does not exist
- Reassigning an already assigned task is allowed

### Design Decision

I reused `taskService.update()` instead of adding a new service method, since assigning only sets the `assignee` field. Validation stays in the validator layer and task modification stays in the service layer.

---

## 3. Tests Added

- Successful assignment
- Empty assignee
- Whitespace-only assignee
- Invalid assignee type
- Non-existent task
- Reassignment

Existing service and API tests were kept.

```text
Tests: 35 passed, 35 total
```

Coverage remains above the 80% target.

---

## 4. Additional Validation Improvements

- Title required on create, optional on update
- Invalid `status`, `priority`, and due date values
- Invalid request body types
- Invalid `assignee` values
