import { useEffect, useMemo, useState } from 'react'
import TaskForm from './components/TaskForm'
import TaskItem from './components/TaskItem'
import EmptyState from './components/EmptyState'
import { Search, LayoutList, CheckCircle2, Circle } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all') // all | active | completed

  const fetchTasks = async (q = '') => {
    setLoading(true)
    const res = await fetch(`${API_BASE}/api/tasks${q ? `?q=${encodeURIComponent(q)}` : ''}`)
    const data = await res.json()
    setTasks(data)
    setLoading(false)
  }

  useEffect(() => { fetchTasks() }, [])

  const handleCreate = async (payload) => {
    await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    await fetchTasks(query)
  }

  const handleToggle = async (task) => {
    await fetch(`${API_BASE}/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed })
    })
    await fetchTasks(query)
  }

  const handleDelete = async (task) => {
    await fetch(`${API_BASE}/api/tasks/${task.id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== task.id))
  }

  const filtered = useMemo(() => {
    if (filter === 'active') return tasks.filter(t => !t.completed)
    if (filter === 'completed') return tasks.filter(t => t.completed)
    return tasks
  }, [tasks, filter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-fuchsia-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600">FocusList</h1>
            <p className="text-gray-600">A minimal, beautiful todo app that helps you get things done.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/70 backdrop-blur border border-gray-200 rounded-xl px-3 py-2">
            <LayoutList className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-700">{tasks.length} tasks</span>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-white/70 backdrop-blur border border-gray-200 rounded-xl px-3 py-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchTasks(query) }}
              placeholder="Search tasks..."
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
            />
            <button onClick={() => fetchTasks(query)} className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg">Search</button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${filter==='all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white/70 backdrop-blur border-gray-200 text-gray-700'}`}
            >
              <LayoutList className="w-4 h-4" /> All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${filter==='active' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white/70 backdrop-blur border-gray-200 text-gray-700'}`}
            >
              <Circle className="w-4 h-4" /> Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${filter==='completed' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white/70 backdrop-blur border-gray-200 text-gray-700'}`}
            >
              <CheckCircle2 className="w-4 h-4" /> Done
            </button>
          </div>
        </div>

        <TaskForm onCreate={handleCreate} />

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_,i) => (
                <div key={i} className="h-16 bg-white/50 rounded-xl border" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onQuickAdd={() => handleCreate({ title: 'Try the app', description: 'This is a demo task', priority: 'high' })} />
          ) : (
            filtered.map(task => (
              <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
            ))
          )}
        </div>

        <footer className="mt-10 text-center text-sm text-gray-500">
          Built for speed and focus. Tip: Press Enter to search.
        </footer>
      </div>
    </div>
  )
}
