import { type ReactNode } from 'react'
import { Header } from './Header'
import { LeftPanel } from './LeftPanel'
import { SkipLink } from '@/components/ui/SkipLink'
import { DataFreshnessBar } from './DataFreshnessBar'

interface AppShellProps {
  children: ReactNode
  rightPanel?: ReactNode
}

export function AppShell({ children, rightPanel }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-navy-950 text-gray-900">
      <SkipLink />
      <Header />
      <div className="relative flex flex-1 overflow-hidden">
        <LeftPanel />
        <main id="main-content" tabIndex={-1} className="relative flex-1 overflow-hidden">
          {children}
        </main>
        {rightPanel && (
          <aside
            className="w-[460px] overflow-y-auto border-l border-black/[0.1] bg-navy-900 shadow-2xl transition-all duration-300"
            aria-label="Disease intelligence panel"
          >
            {rightPanel}
          </aside>
        )}
      </div>
      <DataFreshnessBar />
    </div>
  )
}
