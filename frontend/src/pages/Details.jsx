import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const Details = ({ applicationId, onBack, onStatusUpdated }) => {
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState([
    {
      author: 'System',
      text: 'Application created successfully.',
      timestamp: 'Just now'
    }
  ]);
  const [newNote, setNewNote] = useState('');

  // Fetch application details on mount
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        // GET /api/applications supports fetching all, we can filter for the specific ID client-side
        // to minimize endpoints or fetch direct. Wait, our API design has GET /api/applications.
        // We can just fetch all applications and find by ID, OR we can fetch direct if we had a detail route.
        // Wait, the API contract in the prompt has:
        // GET /api/applications (returns all applications, ordered by latest first)
        // Let's fetch all applications and find the specific one! This perfectly complies with the required API verbs.
        const apps = await apiClient.getApplications();
        const found = apps.find(a => a.id === applicationId);
        if (!found) {
          setError('Application not found.');
        } else {
          setApplication(found);
          // Retrieve custom notes if any from local storage
          const storedNotes = localStorage.getItem(`notes_${applicationId}`);
          if (storedNotes) {
            setNotes(JSON.parse(storedNotes));
          } else {
            const initialNotes = [
              {
                author: 'System',
                text: `Application filed in ${found.language}. Received status: pending.`,
                timestamp: 'Created'
              }
            ];
            setNotes(initialNotes);
            localStorage.setItem(`notes_${applicationId}`, JSON.stringify(initialNotes));
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load application details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (applicationId) {
      fetchDetails();
    }
  }, [applicationId]);

  const handleStatusChange = async (newStatus) => {
    if (!application) return;

    setIsUpdating(true);
    try {
      const response = await apiClient.updateStatus(application.id, newStatus);
      setApplication(response.application);
      
      // Add a note about the status change
      const updatedNotes = [
        ...notes,
        {
          author: 'Ops Manager',
          text: `Updated application status to ${newStatus.toUpperCase()}.`,
          timestamp: 'Just now'
        }
      ];
      setNotes(updatedNotes);
      localStorage.setItem(`notes_${application.id}`, JSON.stringify(updatedNotes));

      // Trigger callback to refresh dashboard stats/lists
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (err) {
      alert(err.message || 'Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePostNote = (e) => {
    e.preventDefault();
    if (!newNote.trim() || !application) return;

    const updatedNotes = [
      ...notes,
      {
        author: 'Ops Officer',
        text: newNote.trim(),
        timestamp: 'Just now'
      }
    ];
    setNotes(updatedNotes);
    localStorage.setItem(`notes_${application.id}`, JSON.stringify(updatedNotes));
    setNewNote('');
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
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full flex items-center gap-2 border border-green-200 shadow-sm w-fit">
            <span className="w-2 h-2 rounded-full bg-green-600"></span>
            <span className="font-semibold text-sm capitalize">Approved</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-full flex items-center gap-2 border border-red-200 shadow-sm w-fit">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span className="font-semibold text-sm capitalize">Rejected</span>
          </div>
        );
      default:
        return (
          <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-full flex items-center gap-2 border border-amber-200 shadow-sm w-fit">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="font-semibold text-sm capitalize">Pending Review</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex-1 p-8 text-center">
        <div className="max-w-md mx-auto py-12 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-sm">
          <span className="material-symbols-outlined text-[48px] text-error mb-2">warning</span>
          <h3 className="text-lg font-bold text-on-surface">Error Loading Application</h3>
          <p className="text-sm text-on-surface-variant mt-1 mb-6">{error || 'Something went wrong'}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary-hover transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
      {/* Scrollable Main Details Area */}
      <div className="flex-1 overflow-y-auto bg-surface p-6 md:p-8">
        <div className="sticky top-0 bg-surface/95 backdrop-blur-sm z-20 pb-4 border-b border-outline-variant/30 mb-8 pt-2">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-xs font-semibold text-on-surface-variant mb-4">
            <button onClick={onBack} className="hover:text-primary transition-colors">
              Dashboard
            </button>
            <span className="mx-2 material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-surface font-medium">{application.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-on-surface">
                {application.name}
              </h2>
              <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">tag</span>
                VT-{application.id.split('-')[0].toUpperCase()}
              </p>
            </div>
            {getStatusBadge(application.status)}
          </div>
        </div>

        {/* Details Grid */}
        <div className="max-w-4xl mx-auto space-y-12 pb-16">
          {/* Personal Information */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">person</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Full Legal Name
                </label>
                <div className="text-md font-medium text-on-surface">{application.name}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Contact Number
                </label>
                <div className="text-md font-medium text-on-surface">+91 {application.mobile}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Preferred Communication Language
                </label>
                <div className="text-md font-medium text-on-surface">{application.language}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Registered Date
                </label>
                <div className="text-md font-medium text-on-surface">{formatDate(application.created_at)}</div>
              </div>
            </div>
          </section>

          {/* Loan Information */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">request_quote</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Loan Details</h3>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-sm">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Requested Amount
                </label>
                <div className="text-4xl font-extrabold text-primary">{formatCurrency(application.amount)}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
                <div className="col-span-1 md:col-span-2">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Loan Purpose
                  </label>
                  <div className="text-md font-medium text-on-surface whitespace-pre-wrap">
                    {application.purpose}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Progress Indicator */}
          <section className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/40">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h4 className="text-md font-bold text-on-surface">Verification Status</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {application.status === 'pending'
                    ? 'Field agent review in progress'
                    : `Underwriting complete - ${application.status}`}
                </p>
              </div>
              <span className="text-lg font-bold text-primary">
                {application.status === 'pending' ? '85%' : '100%'}
              </span>
            </div>
            <div className="w-full bg-outline-variant/40 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 rounded-full"
                style={{ width: application.status === 'pending' ? '85%' : '100%' }}
              ></div>
            </div>
          </section>
        </div>
      </div>

      {/* Agent Actions Docked Right Sidebar */}
      <aside className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-outline-variant bg-surface-container-lowest flex flex-col h-full shadow-[-4px_0_24px_rgba(0,0,0,0.01)] shrink-0">
        {/* Status Actions */}
        <div className="p-6 border-b border-outline-variant/50 sticky top-0 bg-surface-container-lowest z-10">
          <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">gavel</span>
            Agent Decision
          </h3>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleStatusChange('approved')}
              disabled={isUpdating || application.status === 'approved'}
              className="w-full bg-primary text-on-primary font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Approve Loan
            </button>
            <button
              onClick={() => handleStatusChange('rejected')}
              disabled={isUpdating || application.status === 'rejected'}
              className="w-full bg-white text-error border border-error/20 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-error-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              Reject Loan
            </button>
          </div>
        </div>

        {/* Notes Feed */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col bg-surface/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">forum</span>
              Internal Notes
            </h3>
            <span className="text-[10px] font-semibold bg-surface-container-low text-on-surface-variant border border-outline-variant/40 px-2 py-0.5 rounded-md">
              Internal Ops Only
            </span>
          </div>

          {/* Notes History */}
          <div className="flex-1 flex flex-col gap-3 mb-4 overflow-y-auto pr-1">
            {notes.map((note, idx) => (
              <div key={idx} className="flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary text-xs font-bold">
                  {note.author === 'System' ? 'SYS' : note.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/40 p-3 rounded-xl rounded-tl-none shadow-sm text-xs flex-1">
                  <p className="text-on-surface leading-relaxed">{note.text}</p>
                  <span className="text-[10px] text-on-surface-variant block mt-1.5 font-medium">
                    {note.author} • {note.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Note Input */}
          <form onSubmit={handlePostNote} className="mt-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full bg-transparent border-none p-2 text-xs text-on-surface focus:ring-0 resize-none h-16 placeholder:text-on-surface-variant/40"
              placeholder="Add review notes..."
              required
            ></textarea>
            <div className="flex justify-between items-center pt-1 border-t border-outline-variant/30 px-1">
              <span className="text-[10px] text-on-surface-variant/40 font-mono">MD Supported</span>
              <button
                type="submit"
                className="bg-primary/10 text-primary hover:bg-primary/20 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-xs">send</span>
                Post
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
};

export default Details;
