import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | completed

  async function loadTasks() {
    setLoading(true);
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.tasks);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleCreate(payload) {
    const res = await api.post('/tasks', payload);
    setTasks((prev) => [res.data.task, ...prev]);
  }

  async function handleUpdate(id, updates) {
    const res = await api.patch(`/tasks/${id}`, updates);
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? res.data.task : t))
    );
  }

  async function handleDelete(id) {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }

  const visibleTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Hi, {user.name}</h1>
          <p className="muted">{user.email}</p>
        </div>
        <button className="btn-ghost" onClick={logout}>
          Log out
        </button>
      </header>

      <TaskForm onCreate={handleCreate} />

      <div className="filters">
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            className={filter === f ? 'filter active' : 'filter'}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading…</p>}

      {!loading && visibleTasks.length === 0 && (
        <p className="muted">No tasks yet. Add one above.</p>
      )}

      <ul className="task-list">
        {visibleTasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
}