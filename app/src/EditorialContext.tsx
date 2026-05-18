import React, { createContext, useContext } from 'react'

import type { IssueTagId } from './types'

export type EditorialActions = {
  readonly: boolean
  onAddComment: (conceptId: string, body: string) => void
  onToggleIssue: (conceptId: string, tag: IssueTagId) => void
  onExportOverlay: () => void
}

const Ctx = createContext<EditorialActions | null>(null)

export function EditorialProvider({
  value,
  children,
}: {
  value: EditorialActions
  children: React.ReactNode
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useEditorial(): EditorialActions {
  const v = useContext(Ctx)
  if (!v) throw new Error('useEditorial outside provider')
  return v
}
