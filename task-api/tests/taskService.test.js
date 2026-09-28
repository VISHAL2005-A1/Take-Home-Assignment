const taskService = require('../src/services/taskService');

describe('taskService', () => {

  beforeEach(() => {
    taskService._reset();
  });

  test('should create a task', () => {
    const task = taskService.create({
      title: 'Learn Jest'
    });

    expect(task.title).toBe('Learn Jest');
    expect(task.id).toBeDefined();
  });
  test('should return all tasks', () => {
  taskService.create({
    title: 'Task 1'
  });

  taskService.create({
    title: 'Task 2'
  });

  const tasks = taskService.getAll();

  expect(tasks).toHaveLength(2);
  expect(tasks[0].title).toBe('Task 1');
  expect(tasks[1].title).toBe('Task 2');

});
test('should find a task by id', () => {
  const task = taskService.create({
    title: 'Task 1'
  });

  const result = taskService.findById(task.id);

  expect(result).toEqual(task);
});

test('should return undefined for a non-existing id', () => {
  const result = taskService.findById('invalid-id');

  expect(result).toBeUndefined();
});
test('should return tasks with the requested status', () => {
  taskService.create({
    title: 'Todo Task',
    status: 'todo'
  });

  taskService.create({
    title: 'Done Task',
    status: 'done'
  });

  const result = taskService.getByStatus('todo');

  expect(result).toHaveLength(1);
  expect(result[0].title).toBe('Todo Task');
});
test('page 1 should return the first 10 tasks', () => {
  for (let i = 1; i <= 11; i++) {
    taskService.create({
      title: `Task ${i}`
    });
  }

  const result = taskService.getPaginated(1, 10);

  expect(result).toHaveLength(10);
  expect(result[0].title).toBe('Task 1');
  expect(result[9].title).toBe('Task 10');
});
test('should return correct task statistics', () => {
  taskService.create({
    title: 'Todo Task',
    status: 'todo'
  });

  taskService.create({
    title: 'Progress Task',
    status: 'in_progress'
  });

  taskService.create({
    title: 'Done Task',
    status: 'done'
  });

  const stats = taskService.getStats();

  expect(stats.todo).toBe(1);
  expect(stats.in_progress).toBe(1);
  expect(stats.done).toBe(1);
  expect(stats.overdue).toBe(0);
});

test('should count an unfinished overdue task', () => {
  taskService.create({
    title: 'Overdue Task',
    status: 'todo',
    dueDate: '2020-01-01T00:00:00.000Z'
  });

  const stats = taskService.getStats();

  expect(stats.overdue).toBe(1);
});

test('should not count a completed overdue task', () => {
  taskService.create({
    title: 'Completed Task',
    status: 'done',
    dueDate: '2020-01-01T00:00:00.000Z'
  });

  const stats = taskService.getStats();

  expect(stats.overdue).toBe(0);
});

test('should update an existing task', () => {
  const task = taskService.create({
    title: 'Old title'
  });

  const updated = taskService.update(task.id, {
    title: 'New title'
  });

  expect(updated.title).toBe('New title');
  expect(updated.id).toBe(task.id);
});

test('should return null when updating a non-existing task', () => {
  const result = taskService.update('invalid-id', {
    title: 'New title'
  });

  expect(result).toBeNull();
});

test('should remove an existing task', () => {
  const task = taskService.create({
    title: 'Task 1'
  });

  const result = taskService.remove(task.id);

  expect(result).toBe(true);
  expect(taskService.getAll()).toHaveLength(0);
});

test('should return false when removing a non-existing task', () => {
  const result = taskService.remove('invalid-id');

  expect(result).toBe(false);
});

test('should complete an existing task', () => {
  const task = taskService.create({
    title: 'Task 1',
    priority: 'high'
  });

  const completed = taskService.completeTask(task.id);

  expect(completed.status).toBe('done');
  expect(completed.priority).toBe('medium');
  expect(completed.completedAt).toBeDefined();
});

test('should return null when completing a non-existing task', () => {
  const result = taskService.completeTask('invalid-id');

  expect(result).toBeNull();
});
describe('assign task', () => {
  test('should assign a task to an assignee', () => {
    const task = taskService.create({
      title: 'Test task',
    });

    const updatedTask = taskService.update(task.id, {
      assignee: 'Vishal',
    });

    expect(updatedTask.assignee).toBe('Vishal');
  });

  test('should allow reassignment of an already assigned task', () => {
    const task = taskService.create({
      title: 'Test task',
    });

    taskService.update(task.id, {
      assignee: 'Vishal',
    });

    const updatedTask = taskService.update(task.id, {
      assignee: 'Rahul',
    });

    expect(updatedTask.assignee).toBe('Rahul');
  });

  test('should return null when assigning to a non-existent task', () => {
    const updatedTask = taskService.update('non-existent-id', {
      assignee: 'Vishal',
    });

    expect(updatedTask).toBeNull();
  });
});
});