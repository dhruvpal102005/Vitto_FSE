import React from 'react';

const Sidebar = ({ currentPage, onNavigate }) => {
  const handleMockClick = (name) => {
    alert(`${name} is a mock tab for assessment purposes.`);
  };

  return (
    <aside className="hidden md:flex w-[280px] h-screen sticky left-0 top-0 border-r border-outline-variant bg-surface-container-lowest flex-col p-4 flex-shrink-0 z-20">
      {/* Header / Logo */}
      <div className="mb-8 px-4 pt-4">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-[32px]" data-weight="fill">account_balance</span>
          <span className="text-2xl font-bold tracking-tight">Vitto Ops</span>
        </div>
        <p className="text-xs text-on-surface-variant mt-1 font-medium">Enterprise Portal</p>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 space-y-1 px-2">
        {/* Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all duration-200 text-left ${
            currentPage === 'dashboard'
              ? 'bg-primary/10 text-primary relative'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          {currentPage === 'dashboard' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full"></div>
          )}
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          Dashboard
        </button>

        {/* Mock Tabs */}
        <button
          onClick={() => handleMockClick('Underwriting')}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg font-semibold transition-all duration-200 text-left"
        >
          <span className="material-symbols-outlined">verified_user</span>
          Underwriting
        </button>

        <button
          onClick={() => handleMockClick('Borrowers')}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg font-semibold transition-all duration-200 text-left"
        >
          <span className="material-symbols-outlined">group</span>
          Borrowers
        </button>

        <button
          onClick={() => handleMockClick('Reports')}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg font-semibold transition-all duration-200 text-left"
        >
          <span className="material-symbols-outlined">assessment</span>
          Reports
        </button>
      </nav>

      {/* CTA Button to Apply Form */}
      <div className="px-4 mb-4">
        <button
          onClick={() => onNavigate('apply')}
          className={`w-full font-semibold rounded-lg py-2.5 px-4 text-center transition-all shadow-sm flex items-center justify-center gap-2 ${
            currentPage === 'apply'
              ? 'bg-primary text-on-primary hover:bg-primary-hover'
              : 'border border-primary text-primary hover:bg-primary/5'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Application
        </button>
      </div>

      {/* Footer Tabs */}
      <div className="border-t border-outline-variant pt-4 space-y-1 px-2">
        <button
          onClick={() => handleMockClick('Settings')}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg font-semibold transition-all duration-200 text-left"
        >
          <span className="material-symbols-outlined">settings</span>
          Settings
        </button>
        <button
          onClick={() => handleMockClick('Support')}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg font-semibold transition-all duration-200 text-left"
        >
          <span className="material-symbols-outlined">help_outline</span>
          Support
        </button>

        {/* User Profile Snippet */}
        <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors">
          <div className="w-8 h-8 rounded-full bg-surface-container-low overflow-hidden flex-shrink-0 border border-outline-variant flex items-center justify-center font-bold text-primary">
            OP
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-on-surface truncate">Ops Officer</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
