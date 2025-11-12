import { ClipboardList, Plus } from 'lucide-react'

export default function EmptyState({ onQuickAdd }) {
  return (
    <div className="text-center py-16 bg-white/60 backdrop-blur rounded-2xl border border-dashed border-gray-300">
      <ClipboardList className="w-12 h-12 mx-auto text-gray-400" />
      <h3 className="mt-4 text-lg font-semibold text-gray-700">No tasks yet</h3>
      <p className="mt-1 text-gray-500">Organize your day by adding your first task.</p>
      <button
        onClick={onQuickAdd}
        className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
      >
        <Plus className="w-4 h-4" /> Quick add a demo task
      </button>
    </div>
  )
}
