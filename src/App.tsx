import { useState } from 'react'
import Dashboard from './components/Dashboard'
import DataSourcesPage from './components/pages/DataSourcesPage'
import EngineDocsPage from './components/pages/EngineDocsPage'

type Page = 'simulator' | 'data-sources' | 'engine-docs';

const tabs: { id: Page; label: string }[] = [
  { id: 'simulator', label: 'Simulator' },
  { id: 'data-sources', label: 'Data Sources' },
  { id: 'engine-docs', label: 'Engine Docs' },
];

function App() {
  const [page, setPage] = useState<Page>('simulator');

  return (
    <div className="flex flex-col h-screen">
      {/* Navigation Bar */}
      <nav className="flex items-center bg-slate-900 border-b border-slate-700/50 px-4 shrink-0">
        <span className="text-sm font-bold text-slate-300 mr-6 py-2">AI Economy Simulator</span>
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setPage(tab.id)}
              className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
                page === tab.id
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Page Content */}
      <div className="flex-1 overflow-hidden">
        {page === 'simulator' && <Dashboard />}
        {page === 'data-sources' && <DataSourcesPage />}
        {page === 'engine-docs' && <EngineDocsPage />}
      </div>
    </div>
  );
}

export default App
