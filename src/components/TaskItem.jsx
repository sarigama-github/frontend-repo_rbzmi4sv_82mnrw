import { CheckCircle2, Circle, Flag, Trash2, Calendar } from 'lucide-react'

const priorityColors = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-red-100 text-red-700 border-red-200',
}

export default function TaskItem({ task, onToggle, onDelete }) {
  const completed = task.completed
  const due = task.due_date ? new Date(task.due_date) : null
  const overdue = due && !completed && due < new Date()

  return (
    <div className={`group flex items-center gap-3 p-4 rounded-xl border bg-white/70 backdrop-blur shadow-sm transition hover:shadow-md ${completed ? 'opacity-70' : ''}`}>
      <button
        onClick={() => onToggle(task)}
        className="text-gray-500 hover:text-blue-600 transition"
        title={completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {completed ? (
          <CheckCircle2 className="w-6 h-6 text-blue-600" />
        ) : (
          <Circle className="w-6 h-6" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${priorityColors[task.priority || 'medium']}`}>
            <Flag className="w-3 h-3" /> {task.priority || 'medium'}
          </span>
          {due && (
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${overdue ? 'bg-red-100 text-red-700 border-red-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
              <Calendar className="w-3 h-3" /> {due.toLocaleDateString()}
            </span>
          )}
        </div>
        <p className={`mt-1 font-medium truncate ${completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</p>
        {task.description && (
          <p className="text-sm text-gray-500 truncate">{task.description}</p>
        )}
      </div>

      <button
        onClick={() => onDelete(task)}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition"
        title="Delete task"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  )
}
