const request = require('supertest');

const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API', () => {

  beforeEach(() => {
    taskService._reset();
  });

  describe('POST /tasks', () => {

    test('should create a task', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Learn Supertest'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.title).toBe('Learn Supertest');
      expect(response.body.status).toBe('todo');
      expect(response.body.priority).toBe('medium');
      expect(response.body.id).toBeDefined();
    });
  test('should reject a task without a title', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBeDefined();
    });

  });
   describe('GET /tasks', () => {

    test('should return all tasks', async () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const response = await request(app)
        .get('/tasks');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('should filter tasks by status', async () => {
      taskService.create({
        title: 'Todo Task',
        status: 'todo'
      });

      taskService.create({
        title: 'Done Task',
        status: 'done'
      });

      const response = await request(app)
        .get('/tasks?status=todo');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Todo Task');
    });

    test('should paginate tasks', async () => {
      for (let i = 1; i <= 11; i++) {
        taskService.create({
          title: `Task ${i}`
        });
      }

      const response = await request(app)
        .get('/tasks?page=1&limit=10');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(10);
      expect(response.body[0].title).toBe('Task 1');
    });

  });
 describe('PUT /tasks/:id', () => {

    test('should update a task', async () => {
      const task = taskService.create({
        title: 'Old title'
      });

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
          title: 'New title'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.title).toBe('New title');
    });

    test('should return 404 for a non-existing task', async () => {
      const response = await request(app)
        .put('/tasks/invalid-id')
        .send({
          title: 'New title'
        });

      expect(response.statusCode).toBe(404);
    });

  });

  describe('DELETE /tasks/:id', () => {

    test('should delete an existing task', async () => {
      const task = taskService.create({
        title: 'Delete me'
      });

      const response = await request(app)
        .delete(`/tasks/${task.id}`);

      expect(response.statusCode).toBe(204);
    });

    test('should return 404 for a non-existing task', async () => {
      const response = await request(app)
        .delete('/tasks/invalid-id');

      expect(response.statusCode).toBe(404);
    });

  });

  describe('PATCH /tasks/:id/complete', () => {

    test('should complete a task', async () => {
      const task = taskService.create({
        title: 'Complete me'
      });

      const response = await request(app)
        .patch(`/tasks/${task.id}/complete`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('done');
      expect(response.body.completedAt).toBeDefined();
    });

    test('should return 404 for a non-existing task', async () => {
      const response = await request(app)
        .patch('/tasks/invalid-id/complete');

      expect(response.statusCode).toBe(404);
    });

  });

  describe('GET /tasks/stats', () => {

    test('should return task statistics', async () => {
      taskService.create({
        title: 'Todo',
        status: 'todo'
      });

      taskService.create({
        title: 'Done',
        status: 'done'
      });

      const response = await request(app)
        .get('/tasks/stats');

      expect(response.statusCode).toBe(200);
      expect(response.body.todo).toBe(1);
      expect(response.body.done).toBe(1);
      expect(response.body.in_progress).toBe(0);
      expect(response.body.overdue).toBe(0);
    });

  });
  describe('PATCH /tasks/:id/assign', () => {
  test('should assign a task to a user', async () => {
    const task = taskService.create({
      title: 'Assign me',
    });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: 'Vishal' });

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(task.id);
    expect(response.body.assignee).toBe('Vishal');
  });

  test('should reject an empty assignee', async () => {
    const task = taskService.create({
      title: 'Assign me',
    });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: '' });

    expect(response.statusCode).toBe(400);
  });

  test('should reject a whitespace-only assignee', async () => {
    const task = taskService.create({
      title: 'Assign me',
    });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: '   ' });

    expect(response.statusCode).toBe(400);
  });

  test('should return 404 for a non-existing task', async () => {
    const response = await request(app)
      .patch('/tasks/invalid-id/assign')
      .send({ assignee: 'Vishal' });

    expect(response.statusCode).toBe(404);
  });

  test('should allow reassignment of an already assigned task', async () => {
    const task = taskService.create({
      title: 'Reassign me',
    });

    await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: 'Vishal' });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: 'Rahul' });

    expect(response.statusCode).toBe(200);
    expect(response.body.assignee).toBe('Rahul');
  });
});

});