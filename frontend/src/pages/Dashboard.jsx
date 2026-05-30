import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import StatsBar from '../components/StatsBar';

// ── Language badge color map ───────────────────────────────────────────────
const LANG_BADGE = {
  English: 'bg-blue-50 text-blue-700 border border-blue-200',
  Hindi:   'bg-orange-50 text-orange-700 border border-orange-200',
  Tamil:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Telugu:  'bg-purple-50 text-purple-700 border border-purple-200',
  Marathi: 'bg-rose-50 text-rose-700 border border-rose-200',
};

// ── Status badge renderer ──────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#006b2f]/10 text-[#005022]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#005022]" />
        Approved
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-error-container text-on-error-container">
        <span className="w-1.5 h-1.5 rounded-full bg-error" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary-container text-on-secondary-container">
      <span className="w-1.5 h-1.5 rounded-full bg-on-secondary-container" />
      Pending Review
    </span>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────
const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const formatDate = (str) =>
  str ? new Date(str).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

const refId = (id) => `VT-${id.split('-')[0].toUpperCase()}`;

// ── Main Dashboard Component ───────────────────────────────────────────────
const Dashboard = ({ onViewDetails }) => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats]               = useState({});
  const [filter, setFilter]             = useState('all');
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [apps, summary] = await Promise.all([
        apiClient.getApplications(filter, search),
        apiClient.getSummary(),
      ]);
      setApplications(apps);
      setStats(summary);
    } catch (err) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const FILTERS = ['all', 'pending', 'approved', 'rejected'];

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-[1280px] mx-auto w-full">

      {/* ── Page Header ── */}
      <header className="px-8 py-6 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface leading-tight">
          Applications Dashboard
        </h1>
        <p className="text-sm text-on-surface-variant mt-1.5 max-w-xl">
          Monitor, review, and manage borrower loan applications in real time.
        </p>
      </header>

      <div className="px-8 pb-12 flex flex-col gap-8">

        {/* ── Stats Bar ── */}
        <StatsBar stats={stats} />

        {/* ── Filter + Search Controls ── */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

            {/* Search */}
            <div className="relative w-full md:w-[360px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name or mobile..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm transition-all"
              />
            </div>

            {/* Status filter dropdown */}
            <div className="relative w-full md:w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                filter_alt
              </span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant rounded-lg text-sm text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm transition-all cursor-pointer"
              >
                {FILTERS.map((f) => (
                  <option key={f} value={f}>
                    {f === 'all' ? 'All Statuses' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-error-container text-on-error-container rounded-lg border border-error/20 text-sm">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              {error}
            </div>
          )}

          {/* ── Table ── */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-[48px] text-outline-variant mb-3 block">inbox</span>
              <h3 className="text-base font-bold text-on-surface">No Applications Found</h3>
              <p className="text-sm text-on-surface-variant mt-1">
                {searchInput || filter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Submit the first loan application to see it here.'}
              </p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[840px]">
                  {/* Table Header */}
                  <thead className="border-b-2 border-outline-variant">
                    <tr>
                      {['Borrower', 'Mobile', 'Amount & Purpose', 'Lang', 'Status', 'Date', ''].map((h, i) => (
                        <th
                          key={i}
                          className={`py-4 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-widest ${
                            i === 6 ? 'text-right' : ''
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-outline-variant">
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-surface-container-low/30 transition-colors group"
                      >
                        {/* Borrower */}
                        <td className="py-4 px-4">
                          <div className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors leading-tight">
                            {app.name}
                          </div>
                          <div className="text-xs text-on-surface-variant font-mono mt-0.5">
                            {refId(app.id)}
                          </div>
                        </td>

                        {/* Mobile */}
                        <td className="py-4 px-4 text-sm text-on-surface-variant whitespace-nowrap">
                          +91 {app.mobile}
                        </td>

                        {/* Amount & Purpose */}
                        <td className="py-4 px-4">
                          <div className="text-sm font-semibold text-on-surface">
                            {formatINR(app.amount)}
                          </div>
                          <div className="text-xs text-on-surface-variant truncate max-w-[180px]">
                            {app.purpose}
                          </div>
                        </td>

                        {/* Language badge */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${LANG_BADGE[app.language] ?? 'bg-surface-variant text-on-surface-variant border border-outline-variant'}`}>
                            {app.language.slice(0, 2).toUpperCase()}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <StatusBadge status={app.status} />
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-sm text-on-surface-variant whitespace-nowrap">
                          {formatDate(app.created_at)}
                        </td>

                        {/* Action */}
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => onViewDetails(app.id)}
                            className="text-xs font-semibold text-primary hover:text-primary-container transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant bg-surface-container-low/20">
                <p className="text-xs text-on-surface-variant font-medium">
                  Showing <span className="font-bold text-on-surface">{applications.length}</span> {filter !== 'all' ? filter : ''} application{applications.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled
                    className="px-3 py-1.5 border border-outline-variant rounded bg-surface-container-lowest text-outline-variant cursor-not-allowed text-xs font-semibold shadow-sm"
                  >
                    Previous
                  </button>
                  <button
                    disabled
                    className="px-3 py-1.5 border border-outline-variant rounded bg-surface-container-lowest text-outline-variant cursor-not-allowed text-xs font-semibold shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
