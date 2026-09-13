import { useState } from 'react';

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [busy, setBusy] = useState(false);

  async function toggleComplete() {
    setBusy(true);
    try {
      await onUpdate(task._id, { completed: !task.completed });
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    if (!title.trim() || title === task.title) {
      setEditing(false);
      setTitle(task.title);
      return;
    }
    setBusy(true);
    try {
      await onUpdate(task._id, { title: title.trim() });
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await onDelete(task._id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className={`task-card ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={toggleComplete}
        disabled={busy}
      />

      {editing ? (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') {
              setEditing(false);
              setTitle(task.title);
            }
          }}
          autoFocus
        />
      ) : (
        <span className="task-title" onDoubleClick={() => setEditing(true)}>
          {task.title}
        </span>
      )}

      <span className={`priority priority-${task.priority}`}>
        {task.priority}
      </span>

      <div className="task-actions">
        {editing ? (
          <>
            <button onClick={saveEdit} disabled={busy}>Save</button>
            <button onClick={() => { setEditing(false); setTitle(task.title); }}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} disabled={busy}>Edit</button>
            <button onClick={handleDelete} disabled={busy}>Delete</button>
          </>
        )}
      </div>
    </li>
  );
}