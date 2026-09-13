import { Router } from 'express';
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Every task route requires auth
router.use(requireAuth);

router.get('/', listTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;