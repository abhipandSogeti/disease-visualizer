import { type ReactNode } from 'react'
import { Header } from './Header'
import { LeftPanel } from './LeftPanel'
import { BottomBar } from './BottomBar'

interface AppShellProps {
  children: ReactNode
  rightPanel?: ReactNode
}

export function AppShell({ children, rightPanel }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-navy-950 text-slate-100">
      <Header />
      <div className="relative flex flex-1 overflow-hidden">
        <LeftPanel />
        <main className="relative flex-1 overflow-hidden">{children}</main>
        {rightPanel && (
          <aside
            className="w-96 overflow-y-auto border-l border-slate-800 bg-navy-900 shadow-2xl transition-all duration-300"
            aria-label="Disease intelligence panel"
          >
            {rightPanel}
          </aside>
        )}
      </div>
      <BottomBar />
    </div>
  )
}
