import React from 'react';

const NAV_ITEMS = [
  { key: 'dashboard', icon: 'dashboard',     label: 'Dashboard' },
  { key: 'details',   icon: 'description',   label: 'Applications' },
  { key: '__mock_underwriting', icon: 'verified_user', label: 'Underwriting' },
  { key: '__mock_borrowers',    icon: 'group',          label: 'Borrowers' },
  { key: '__mock_reports',      icon: 'assessment',     label: 'Reports' },
];

const Sidebar = ({ currentPage, onNavigate }) => {
  const handleMockClick = (name) => {
    alert(`${name} is a mock tab for assessment purposes.`);
  };

  return (
    <aside className="hidden md:flex w-[280px] h-screen sticky left-0 top-0 bg-surface-container-lowest border-r border-outline-variant flex-col p-3 flex-shrink-0 z-20">

      {/* Logo */}
      <div className="mb-8 px-4 pt-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xl select-none">
          V
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary leading-tight tracking-tight">Vitto Ops</h1>
          <p className="text-xs text-on-surface-variant font-medium">Enterprise Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map(({ key, icon, label }) => {
          const isMock = key.startsWith('__mock_');
          const isActive = !isMock && currentPage === key;

          return (
            <button
              key={key}
              onClick={() => {
                if (isMock) {
                  handleMockClick(label);
                } else {
                  onNavigate(key);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 active:scale-[0.98] text-left ${
                isActive
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container'
              }`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              {label}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto pt-4 border-t border-outline-variant flex flex-col gap-1">
        {/* New Application CTA */}
        <button
          onClick={() => onNavigate('apply')}
          className="w-full bg-primary text-on-primary font-semibold text-sm py-3 rounded-lg shadow-sm hover:bg-primary-hover transition-colors mb-3 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Application
        </button>

        {/* Settings & Support */}
        {[
          { icon: 'settings',    label: 'Settings' },
          { icon: 'help_outline', label: 'Support' },
        ].map(({ icon, label }) => (
          <button
            key={label}
            onClick={() => handleMockClick(label)}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container rounded-lg text-sm font-medium transition-colors duration-200 text-left"
          >
            <span className="material-symbols-outlined">{icon}</span>
            {label}
          </button>
        ))}

        {/* User profile */}
        <div className="flex items-center gap-3 px-4 py-3 mt-1 rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center text-xs font-bold text-on-primary-container">
            OP
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-on-surface truncate">Ops Officer</p>
            <p className="text-xs text-on-surface-variant truncate">ops@vitto.in</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
