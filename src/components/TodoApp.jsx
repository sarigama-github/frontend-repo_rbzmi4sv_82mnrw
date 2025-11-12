import { useEffect, useMemo, useState } from 'react'
import { Check, Circle, Trash2, Plus, Calendar, Star, X, Pencil, Search, Filter } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function PriorityBadge({ priority }) {
  const map = {
    1: { label: 'High', color: 'bg-red-100 text-red-700 border-red-200' },
    2: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    3: { label: 'Low', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  }
  const cfg = map[priority || 2]
  return (
    <span className={classNames('inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border', cfg.color)}>
      <Star size={12} /> {cfg.label}
    </span>
  )
}

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  return (
    <div className="group flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all">
      <button
        onClick={() => onToggle(task)}
        className={classNames(
          'mt-1 flex h-6 w-6 items-center justify-center rounded-full border transition-colors',
          task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-gray-400 hover:border-emerald-400 hover:text-emerald-500'
        )}
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {task.completed ? <Check size={16} /> : <Circle size={16} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={classNames('font-medium text-gray-800 truncate', task.completed && 'line-through text-gray-400')}>{task.title}</p>
          <PriorityBadge priority={task.priority} />
        </div>
        {task.notes && (
          <p className={classNames('text-sm text-gray-500 mt-0.5', task.completed && 'line-through')}>{task.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(task)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Edit">
          <Pencil size={16} />
        </button>
        <button onClick={() => onDelete(task)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" aria-label="Delete">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

function TaskForm({ onSubmit, onCancel, initial }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [notes, setNotes] = useState(initial?.notes || '')
  const [priority, setPriority] = useState(initial?.priority || 2)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!title.trim()) return
        onSubmit({ title: title.trim(), notes: notes.trim() || undefined, priority, completed: initial?.completed || false })
      }}
      className="p-4 bg-white/80 rounded-xl border border-gray-100 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to do?"
            className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional details"
            className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={1}>High</option>
            <option value={2}>Medium</option>
            <option value={3}>Low</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
            <X className="inline mr-1" size={14} /> Cancel
          </button>
        )}
        <button type="submit" className="px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="inline mr-1" size={14} /> Save Task
        </button>
      </div>
    </form>
  )
}

export default function TodoApp() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    let list = tasks
    if (filter === 'active') list = list.filter(t => !t.completed)
    if (filter === 'completed') list = list.filter(t => t.completed)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(t => (t.title + ' ' + (t.notes || '')).toLowerCase().includes(q))
    }
    return list
  }, [tasks, query, filter])

  async function fetchTasks() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/tasks`)
      const data = await res.json()
      setTasks(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function addTask(payload) {
    const res = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    setTasks(prev => [data, ...prev])
  }

  async function toggleTask(task) {
    const res = await fetch(`${API_BASE}/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed })
    })
    const updated = await res.json()
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t))
  }

  async function deleteTask(task) {
    await fetch(`${API_BASE}/api/tasks/${task.id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== task.id))
  }

  async function saveEdit(taskId, payload) {
    const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const updated = await res.json()
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t))
    setEditing(null)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600">Tasks</h1>
            <p className="text-sm text-gray-500">Organize your day with elegance.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/80 rounded-xl border border-gray-100 px-3 py-2 shadow-sm">
            <Search size={16} className="text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks" className="bg-transparent focus:outline-none text-sm" />
          </div>
        </header>

        <div className="grid gap-4">
          <TaskForm onSubmit={editing ? (payload) => saveEdit(editing.id, payload) : addTask} onCancel={editing ? () => setEditing(null) : undefined} initial={editing || undefined} />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white/80 rounded-xl border border-gray-100 px-3 py-2 shadow-sm md:hidden">
              <Search size={16} className="text-gray-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks" className="bg-transparent focus:outline-none text-sm" />
            </div>
            <div className="flex items-center gap-2">
              {['all','active','completed'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={classNames('px-3 py-1.5 text-sm rounded-lg border transition', filter===f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white')}>{f[0].toUpperCase()+f.slice(1)}</button>
              ))}
              <span className="text-xs text-gray-500 ml-2">{filtered.length} shown</span>
            </div>
          </div>

          <div className="grid gap-3">
            {loading ? (
              <div className="animate-pulse grid gap-2">
                {[...Array(4)].map((_,i) => (
                  <div key={i} className="h-16 rounded-xl bg-white/60 border border-gray-100" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 bg-white/60 rounded-2xl border border-gray-100">
                <div className="mx-auto w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Plus size={20} />
                </div>
                <p className="mt-3 text-gray-700 font-medium">No tasks yet</p>
                <p className="text-sm text-gray-500">Add your first task to get started.</p>
              </div>
            ) : (
              filtered.map(task => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onEdit={setEditing} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
