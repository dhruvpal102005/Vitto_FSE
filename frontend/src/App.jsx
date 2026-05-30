import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Apply from './pages/Apply';
import Dashboard from './pages/Dashboard';
import Details from './pages/Details';

function App() {
  const [currentPage, setCurrentPage] = useState('apply');
  const [selectedId, setSelectedId] = useState(null);

  // Hash-based client side router
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#apply';
      
      if (hash === '#dashboard') {
        setCurrentPage('dashboard');
        setSelectedId(null);
      } else if (hash.startsWith('#details/')) {
        const id = hash.replace('#details/', '');
        setCurrentPage('details');
        setSelectedId(id);
      } else {
        setCurrentPage('apply');
        setSelectedId(null);
      }
    };

    // Run on initial mount
    handleHashChange();

    // Listen to back/forward button changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page, id = null) => {
    if (page === 'details' && id) {
      window.location.hash = `#details/${id}`;
    } else if (page === 'dashboard') {
      window.location.hash = '#dashboard';
    } else {
      window.location.hash = '#apply';
    }
  };

  const handleStatusUpdated = () => {
    // Optional: We can trigger notifications or cache invalidation if needed.
    // Dashboard page has its own useEffect that triggers on filters, so it naturally refreshes
    // when navigated back.
  };

  // Render Borrower flow (Form only)
  if (currentPage === 'apply') {
    return <Apply onNavigate={(p) => navigateTo(p)} />;
  }

  // Render Operations Team flow (Sidebar + main layout)
  return (
    <div className="bg-surface text-on-surface font-sans antialiased min-h-screen flex">
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} onNavigate={(p) => navigateTo(p)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        {/* Top Header App Bar */}
        <header className="bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center w-full px-6 md:px-8 h-20 z-30 sticky top-0">
          <div className="flex items-center gap-8 h-full">
            {/* Mobile Header Toggle */}
            <div className="md:hidden flex items-center gap-2 text-primary font-bold text-lg">
              <span className="material-symbols-outlined text-[28px]" data-weight="fill">account_balance</span>
              <span>Vitto Ops</span>
            </div>

            {/* Sub Nav Tab items */}
            <nav className="hidden md:flex items-end h-full gap-8">
              <button
                onClick={() => navigateTo('dashboard')}
                className={`pb-4 text-sm font-semibold transition-all border-b-2 hover:text-primary ${
                  currentPage === 'dashboard'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant'
                }`}
              >
                Applications Overview
              </button>
              <button
                onClick={() => alert('Direct Loans is a mock tab')}
                className="text-on-surface-variant pb-4 text-sm font-semibold hover:text-primary border-b-2 border-transparent transition-all"
              >
                Direct Loans
              </button>
              <button
                onClick={() => alert('Syndication is a mock tab')}
                className="text-on-surface-variant pb-4 text-sm font-semibold hover:text-primary border-b-2 border-transparent transition-all"
              >
                Partnerships
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('apply')}
              className="bg-primary text-on-primary font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
            >
              New Application
            </button>
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <button
                onClick={() => alert('Mock notifications')}
                className="p-2 hover:bg-surface-container-low rounded-full transition-colors flex items-center"
              >
                <span className="material-symbols-outlined text-xl">notifications</span>
              </button>
              <button
                onClick={() => alert('Language options')}
                className="p-2 hover:bg-surface-container-low rounded-full transition-colors flex items-center"
              >
                <span className="material-symbols-outlined text-xl">language</span>
              </button>
              <div className="h-8 w-[1px] bg-outline-variant mx-1"></div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-primary" data-weight="fill">
                  account_circle
                </span>
                <span className="hidden sm:inline text-xs font-semibold text-on-surface">Officer</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Page Content */}
        <main className="flex-1 overflow-hidden">
          {currentPage === 'dashboard' && (
            <Dashboard onViewDetails={(id) => navigateTo('details', id)} />
          )}
          {currentPage === 'details' && (
            <Details
              applicationId={selectedId}
              onBack={() => navigateTo('dashboard')}
              onStatusUpdated={handleStatusUpdated}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
