import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

// ── Helpers ────────────────────────────────────────────────────────────────
const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const formatDate = (str) => {
  if (!str) return '';
  return new Date(str).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const refId = (id) => `VT-${id.split('-')[0].toUpperCase()}`;

// ── Status badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  if (status === 'approved') {
    return (
      <div className="bg-[#006b2f]/10 text-[#005022] px-4 py-2 rounded-full flex items-center gap-2 w-fit shadow-sm border border-[#006b2f]/20">
        <span className="w-2 h-2 rounded-full bg-[#005022]" />
        <span className="font-semibold text-sm">Approved</span>
      </div>
    );
  }
  if (status === 'rejected') {
    return (
      <div className="bg-error-container text-on-error-container px-4 py-2 rounded-full flex items-center gap-2 w-fit shadow-sm border border-error/20">
        <span className="w-2 h-2 rounded-full bg-error" />
        <span className="font-semibold text-sm">Rejected</span>
      </div>
    );
  }
  return (
    <div className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full flex items-center gap-2 w-fit shadow-sm border border-secondary-container/50">
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      <span className="font-semibold text-sm">Pending Review</span>
    </div>
  );
};

// ── Progress bar ──────────────────────────────────────────────────────────
const ProgressBar = ({ status }) => {
  const pct = status === 'pending' ? 85 : 100;
  return (
    <div className="p-8 bg-surface-container-low rounded-3xl">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h4 className="text-xl font-semibold text-on-surface">Application Status</h4>
          <p className="text-sm text-on-surface-variant mt-1">
            {status === 'pending'
              ? 'Information gathering near completion'
              : `Underwriting complete — ${status}`}
          </p>
        </div>
        <span className="text-2xl font-bold text-primary">{pct}%</span>
      </div>
      <div className="relative pt-1">
        <div className="overflow-hidden h-3 mb-4 rounded-full bg-outline-variant/30">
          <div
            className="h-full rounded-full bg-primary transition-all duration-1000 ease-out relative overflow-hidden progress-stripes"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ── Info field ────────────────────────────────────────────────────────────
const Field = ({ label, value }) => (
  <div className="group">
    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">
      {label}
    </label>
    <div className="text-lg font-medium text-on-surface group-hover:text-primary transition-colors leading-snug">
      {value || '—'}
    </div>
  </div>
);

// ── Note bubble ──────────────────────────────────────────────────────────
const NoteBubble = ({ note }) => {
  const initials = note.author === 'System'
    ? 'SYS'
    : note.author.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-primary text-xs font-bold">
        {initials}
      </div>
      <div className="bg-surface-container-lowest border border-outline-variant/30 p-3 rounded-2xl rounded-tl-sm shadow-sm text-sm flex-1">
        <p className="text-on-surface leading-relaxed">{note.text}</p>
        <span className="text-xs text-on-surface-variant mt-2 block">
          {note.author} · {note.timestamp}
        </span>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
const Details = ({ applicationId, onBack, onStatusUpdated }) => {
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);
  const [isUpdating, setIsUpdating]   = useState(false);
  const [notes, setNotes]             = useState([]);
  const [newNote, setNewNote]         = useState('');

  // ── Fetch application ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const found = await apiClient.getApplication(applicationId);
        setApplication(found);

        const storedNotes = localStorage.getItem(`notes_${applicationId}`);
        if (storedNotes) {
          setNotes(JSON.parse(storedNotes));
        } else {
          const initialNotes = [{
            author: 'System',
            text: `Application filed in ${found.language}. Status: ${found.status}.`,
            timestamp: formatDate(found.created_at),
          }];
          setNotes(initialNotes);
          localStorage.setItem(`notes_${applicationId}`, JSON.stringify(initialNotes));
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load application details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (applicationId) fetchDetails();
  }, [applicationId]);

  // ── Status change ─────────────────────────────────────────────────────
  const handleStatusChange = async (newStatus) => {
    if (!application) return;
    setIsUpdating(true);
    try {
      const response = await apiClient.updateStatus(application.id, newStatus);
      setApplication(response.application);

      const now = new Date().toLocaleString('en-IN', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      const updatedNotes = [
        ...notes,
        {
          author: 'Ops Manager',
          text: `Updated application status to ${newStatus.toUpperCase()}.`,
          timestamp: now,
        },
      ];
      setNotes(updatedNotes);
      localStorage.setItem(`notes_${application.id}`, JSON.stringify(updatedNotes));

      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      alert(err.message || 'Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Post note ─────────────────────────────────────────────────────────
  const handlePostNote = (e) => {
    e.preventDefault();
    if (!newNote.trim() || !application) return;

    const now = new Date().toLocaleString('en-IN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const updatedNotes = [
      ...notes,
      { author: 'Ops Officer', text: newNote.trim(), timestamp: now },
    ];
    setNotes(updatedNotes);
    localStorage.setItem(`notes_${application.id}`, JSON.stringify(updatedNotes));
    setNewNote('');
  };

  // ── Loading ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────
  if (error || !application) {
    return (
      <div className="flex-1 p-8 text-center">
        <div className="max-w-md mx-auto py-12 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm">
          <span className="material-symbols-outlined text-[48px] text-error mb-2 block">warning</span>
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

      {/* ── Scrollable Main Content ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-surface p-6 md:p-8">

        {/* Sticky breadcrumb + title header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur-sm z-20 pb-4 border-b border-outline-variant/30 mb-8 -mx-8 px-8 pt-2">
          <nav className="flex items-center text-sm text-on-surface-variant mb-4">
            <button onClick={onBack} className="hover:text-primary transition-colors font-medium">
              Dashboard
            </button>
            <span className="mx-2 material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="hover:text-primary transition-colors cursor-pointer font-medium" onClick={onBack}>
              Applications
            </span>
            <span className="mx-2 material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-surface font-semibold">{application.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-on-surface">
                {application.name}
              </h2>
              <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">tag</span>
                {refId(application.id)}
              </p>
            </div>
            <StatusBadge status={application.status} />
          </div>
        </div>

        {/* ── Content sections ──────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto space-y-16 pb-16">

          {/* Personal Information */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">person</span>
              </div>
              <h3 className="text-2xl font-semibold text-on-surface">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <Field label="Full Legal Name"              value={application.name} />
              <Field label="Contact Number"               value={`+91 ${application.mobile}`} />
              <Field label="Preferred Language"           value={application.language} />
              <Field label="Application Date"             value={formatDate(application.created_at)} />
            </div>
          </section>

          <hr className="border-outline-variant/30" />

          {/* Loan Information */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">request_quote</span>
              </div>
              <h3 className="text-2xl font-semibold text-on-surface">Loan Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 mb-12">
              {/* Amount — full width card */}
              <div className="col-span-1 md:col-span-2 p-6 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">
                  Requested Amount
                </label>
                <div className="text-5xl font-extrabold text-primary tracking-tight">
                  {formatINR(application.amount)}
                </div>
              </div>

              <Field label="Loan Purpose"   value={application.purpose} />
              <Field label="Current Status" value={application.status.charAt(0).toUpperCase() + application.status.slice(1)} />
            </div>

            {/* Progress indicator */}
            <ProgressBar status={application.status} />
          </section>

        </div>
      </div>

      {/* ── Docked Right Sidebar ────────────────────────────────────── */}
      <aside className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-outline-variant bg-surface-container-lowest flex flex-col h-full shadow-[-4px_0_24px_rgba(0,0,0,0.02)] shrink-0 z-10">

        {/* Agent Actions — sticky */}
        <div className="p-6 border-b border-outline-variant/50 bg-surface-container-lowest sticky top-0 z-10">
          <h3 className="text-xl font-semibold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">gavel</span>
            Agent Actions
          </h3>

          <div className="space-y-3">
            <button
              onClick={() => handleStatusChange('approved')}
              disabled={isUpdating || application.status === 'approved'}
              className="w-full bg-primary text-on-primary font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-primary active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-on-primary" />
              ) : (
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              )}
              Approve Application
            </button>

            <button
              onClick={() => handleStatusChange('rejected')}
              disabled={isUpdating || application.status === 'rejected'}
              className="w-full bg-surface text-error font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-error-container transition-all border border-error/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              Reject Application
            </button>
          </div>
        </div>

        {/* Internal Notes */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col bg-surface/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">forum</span>
              Internal Notes
            </h3>
            <span className="text-xs font-medium bg-surface-variant text-on-surface-variant px-2 py-1 rounded-md">
              Confidential
            </span>
          </div>

          {/* Notes list */}
          <div className="flex-1 flex flex-col gap-4 mb-6 overflow-y-auto pr-1">
            {notes.map((note, idx) => (
              <NoteBubble key={idx} note={note} />
            ))}
          </div>

          {/* Note input */}
          <form
            onSubmit={handlePostNote}
            className="mt-auto bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all"
          >
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full bg-transparent border-none p-3 text-sm text-on-surface focus:ring-0 resize-none h-24 placeholder:text-on-surface-variant/50"
              placeholder="Type a note… (Markdown supported)"
            />
            <div className="flex justify-between items-center px-2 pb-2">
              <div className="flex gap-1 text-on-surface-variant">
                <button type="button" className="p-1.5 hover:bg-surface-variant rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-[20px]">attach_file</span>
                </button>
                <button type="button" className="p-1.5 hover:bg-surface-variant rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-[20px]">format_bold</span>
                </button>
              </div>
              <button
                type="submit"
                className="bg-primary/10 text-primary font-semibold px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors flex items-center gap-1 text-sm"
              >
                <span className="material-symbols-outlined text-sm">send</span>
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
