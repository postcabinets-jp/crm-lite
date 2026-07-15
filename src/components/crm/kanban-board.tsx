'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { updateDealStage } from '@/app/actions/deals'
import type { Deal } from '@/lib/supabase/types'

const STAGES = [
  { key: 'lead', label: 'リード', color: 'border-t-blue-400' },
  { key: 'qualified', label: '見込み', color: 'border-t-indigo-400' },
  { key: 'proposal', label: '提案', color: 'border-t-yellow-400' },
  { key: 'negotiation', label: '交渉', color: 'border-t-orange-400' },
  { key: 'closed_won', label: '受注', color: 'border-t-green-500' },
  { key: 'closed_lost', label: '失注', color: 'border-t-neutral-400' },
] as const

type Stage = (typeof STAGES)[number]['key']

interface Props {
  initialDeals: Deal[]
}

export function KanbanBoard({ initialDeals }: Props) {
  const [deals, setDeals] = useState(initialDeals)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<Stage | null>(null)
  const [, startTransition] = useTransition()

  function dealsByStage(stage: Stage) {
    return deals.filter((d) => d.stage === stage)
  }

  function handleDragStart(e: React.DragEvent, dealId: string) {
    setDraggingId(dealId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, stage: Stage) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverStage(stage)
  }

  function handleDrop(e: React.DragEvent, stage: Stage) {
    e.preventDefault()
    if (!draggingId) return

    const deal = deals.find((d) => d.id === draggingId)
    if (!deal || deal.stage === stage) {
      setDraggingId(null)
      setOverStage(null)
      return
    }

    const prevDeals = deals

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === draggingId ? { ...d, stage } : d)),
    )
    setDraggingId(null)
    setOverStage(null)

    // Server action with rollback on failure
    const draggedId = draggingId
    startTransition(async () => {
      const fd = new FormData()
      fd.set('dealId', draggedId)
      fd.set('stage', stage)
      const result = await updateDealStage(fd)
      if (result?.error) {
        // Rollback optimistic update
        setDeals(prevDeals)
      }
    })
  }

  function handleDragEnd() {
    setDraggingId(null)
    setOverStage(null)
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[60vh]">
      {STAGES.map(({ key, label, color }) => {
        const stageDeals = dealsByStage(key)
        const totalValue = stageDeals.reduce((s, d) => s + d.value, 0)
        const isOver = overStage === key

        return (
          <div
            key={key}
            className={`flex-shrink-0 w-64 flex flex-col rounded-xl border-2 border-transparent transition-colors ${isOver ? 'border-neutral-300 bg-neutral-100' : ''}`}
            onDragOver={(e) => handleDragOver(e, key)}
            onDrop={(e) => handleDrop(e, key)}
            onDragLeave={() => setOverStage(null)}
          >
            {/* Column header */}
            <div
              className={`bg-white border border-neutral-200 rounded-xl p-3 mb-2 border-t-4 ${color}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-semibold text-neutral-900">
                  {label}
                </span>
                <span className="text-xs font-medium text-neutral-500 bg-neutral-100 rounded px-1.5 py-0.5">
                  {stageDeals.length}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                ¥{totalValue.toLocaleString()}
              </p>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 flex-1">
              {stageDeals.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white border border-neutral-200 rounded-xl p-3 cursor-grab active:cursor-grabbing select-none transition-opacity ${
                    draggingId === deal.id ? 'opacity-40' : 'hover:border-neutral-300 hover:shadow-sm'
                  }`}
                >
                  <Link
                    href={`/dashboard/deals/${deal.id}`}
                    className="block text-sm font-medium text-neutral-900 hover:text-blue-600 mb-1.5 truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {deal.title}
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-700">
                      ¥{deal.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {deal.probability}%
                    </span>
                  </div>
                  {deal.expected_close_date && (
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(deal.expected_close_date).toLocaleDateString(
                        'ja-JP',
                        { month: 'short', day: 'numeric' },
                      )}
                    </p>
                  )}
                </div>
              ))}

              {stageDeals.length === 0 && (
                <div
                  className={`flex-1 min-h-[80px] rounded-xl border-2 border-dashed transition-colors ${
                    isOver
                      ? 'border-neutral-400 bg-neutral-50'
                      : 'border-neutral-100'
                  }`}
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
