import Task from '../models/Task.js';

// GET /api/tasks
export async function listTasks(req, res, next) {
  try {
    const { completed, priority } = req.query;

    const filter = { userId: req.userId };
    if (completed !== undefined) filter.completed = completed === 'true';
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

// POST /api/tasks
export async function createTask(req, res, next) {
  try {
    const { title, description, priority, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await Task.create({
      userId: req.userId, // always from the token, never the body
      title: title.trim(),
      description,
      priority,
      dueDate,
    });

    res.status(201).json({ task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
}

// PATCH /api/tasks/:id
export async function updateTask(req, res, next) {
  try {
    const { title, description, completed, priority, dueDate } = req.body;

    // Build the update object explicitly - never spread req.body
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description;
    if (completed !== undefined) updates.completed = completed;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, // ownership enforced here
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task id' });
    }
    next(err);
  }
}

// DELETE /api/tasks/:id
export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId, // ownership enforced here
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted', task });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task id' });
    }
    next(err);
  }
}