import React from 'react';

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const StatsBar = ({ stats = {} }) => {
  const items = [
    {
      label: 'Total Applications',
      value: (stats.totalApplications ?? 0).toLocaleString('en-IN'),
      icon: 'list_alt',
      color: 'text-primary',
    },
    {
      label: 'Total Amount',
      value: formatINR(stats.totalAmountRequested ?? 0),
      icon: 'payments',
      color: 'text-primary',
    },
    {
      label: 'Pending',
      value: (stats.pendingCount ?? 0).toLocaleString('en-IN'),
      icon: 'hourglass_empty',
      color: 'text-on-surface-variant',
    },
    {
      label: 'Approved',
      value: (stats.approvedCount ?? 0).toLocaleString('en-IN'),
      icon: 'check_circle',
      color: 'text-tertiary',
    },
    {
      label: 'Rejected',
      value: (stats.rejectedCount ?? 0).toLocaleString('en-IN'),
      icon: 'cancel',
      color: 'text-error',
    },
  ];

  return (
    <section className="bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant rounded-xl shadow-sm overflow-hidden w-full">
      <div className="flex flex-col lg:flex-row lg:items-stretch divide-y lg:divide-y-0 lg:divide-x divide-outline-variant">
        {items.map((item, idx) => (
          <div key={idx} className="flex-1 flex items-center gap-4 px-6 py-5">
            <div className={`${item.color} opacity-80 flex items-center shrink-0`}>
              <span className="material-symbols-outlined text-[32px]">{item.icon}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest leading-none">
                {item.label}
              </p>
              <p className="text-2xl font-bold text-on-surface mt-1.5 leading-none">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsBar;
