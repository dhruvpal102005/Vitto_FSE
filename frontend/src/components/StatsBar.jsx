import React from 'react';

const StatsBar = ({ stats }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const items = [
    {
      title: 'Total Applications',
      value: stats.totalApplications || 0,
      icon: 'list_alt',
      colorClass: 'text-primary',
      bgClass: 'bg-primary/10'
    },
    {
      title: 'Total Amount',
      value: formatCurrency(stats.totalAmountRequested || 0),
      icon: 'payments',
      colorClass: 'text-primary',
      bgClass: 'bg-primary/10'
    },
    {
      title: 'Pending',
      value: stats.pendingCount || 0,
      icon: 'hourglass_empty',
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50'
    },
    {
      title: 'Approved',
      value: stats.approvedCount || 0,
      icon: 'check_circle',
      colorClass: 'text-tertiary',
      bgClass: 'bg-tertiary-container'
    },
    {
      title: 'Rejected',
      value: stats.rejectedCount || 0,
      icon: 'cancel',
      colorClass: 'text-error',
      bgClass: 'bg-error-container'
    }
  ];

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap lg:items-center divide-y md:divide-y-0 lg:divide-x divide-outline-variant shadow-sm gap-y-4 md:gap-y-6 lg:gap-y-0">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex-1 px-6 py-2 md:py-4 lg:py-0 first:pl-0 last:pr-0 flex items-center gap-4 min-w-[200px]"
        >
          <div className={`w-12 h-12 rounded-full ${item.bgClass} flex items-center justify-center shrink-0 ${item.colorClass}`}>
            <span className="material-symbols-outlined text-2xl" data-weight="fill">
              {item.icon}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              {item.title}
            </p>
            <p className="text-2xl font-bold text-on-surface mt-0.5">
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default StatsBar;
