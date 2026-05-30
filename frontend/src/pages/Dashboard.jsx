import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import StatsBar from '../components/StatsBar';

const Dashboard = ({ onViewDetails }) => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch applications and stats
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [appsData, statsData] = await Promise.all([
        apiClient.getApplications(statusFilter, searchTerm),
        apiClient.getSummary()
      ]);
      setApplications(appsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, searchTerm]);

  const handleStatusFilterChange = (filter) => {
    setStatusFilter(filter);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge colors
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-tertiary-container text-tertiary">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-error-container text-on-error-container border border-error/10">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary-container text-on-secondary-container">
            <span className="w-1.5 h-1.5 rounded-full bg-on-secondary-container"></span>
            Pending Review
          </span>
        );
    }
  };

  // Get language badge colors (Bonus requirement)
  const getLanguageBadge = (lang) => {
    switch (lang) {
      case 'English':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Hindi':
        return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'Tamil':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'Telugu':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'Marathi':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto w-full">
      {/* Dashboard Header */}
      <header className="px-6 md:px-8 py-6 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">
          Applications Dashboard
        </h1>
        <p className="text-sm text-on-surface-variant mt-2 max-w-2xl">
          Monitor, review, and manage borrower applications coming in from the field.
        </p>
      </header>

      {/* Content Area */}
      <div className="px-6 md:px-8 pb-12 flex flex-col gap-8">
        {/* Stats Row */}
        <StatsBar stats={stats} />

        {/* Filters and Table Section */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
            {/* Search Input */}
            <div className="relative w-full md:w-[360px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name or mobile..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/40 shadow-sm transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-surface-container-lowest p-1.5 rounded-xl border border-outline-variant overflow-x-auto shadow-sm w-full md:w-auto">
              {['all', 'pending', 'approved', 'rejected'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleStatusFilterChange(filter)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
                    statusFilter === filter
                      ? 'bg-surface-container-low border border-outline-variant/60 text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Data Table */}
          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/15">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-2">
                info
              </span>
              <h3 className="text-lg font-bold text-on-surface">No Applications Found</h3>
              <p className="text-sm text-on-surface-variant mt-1">
                Try adjusting your search query or filters.
              </p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low/30 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      <th className="py-4 px-6">Borrower</th>
                      <th className="py-4 px-6">Mobile</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Purpose</th>
                      <th className="py-4 px-6">Lang</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-surface-container-low/20 transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <div className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                            {app.name}
                          </div>
                          <div className="text-xs text-on-surface-variant font-mono mt-0.5">
                            VT-{app.id.split('-')[0].toUpperCase()}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-on-surface-variant">
                          +91 {app.mobile}
                        </td>
                        <td className="py-4 px-6 text-sm font-semibold text-on-surface">
                          {formatCurrency(app.amount)}
                        </td>
                        <td className="py-4 px-6 text-sm text-on-surface-variant max-w-[200px] truncate">
                          {app.purpose}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${getLanguageBadge(app.language)}`}>
                            {app.language}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="py-4 px-6 text-sm text-on-surface-variant whitespace-nowrap">
                          {formatDate(app.created_at)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => onViewDetails(app.id)}
                            className="text-sm font-semibold text-primary hover:text-primary-hover hover:underline transition-all"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer info */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/60 bg-surface-container-low/10 text-xs text-on-surface-variant font-medium">
                <span>Showing {applications.length} entries</span>
                <span className="font-mono">Vitto Operations Portal</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
