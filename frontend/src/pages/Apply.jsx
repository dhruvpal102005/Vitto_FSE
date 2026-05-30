import React, { useState } from 'react';
import { apiClient } from '../api/client';

const Apply = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    amount: '',
    purpose: '',
    language: 'English'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null); // { referenceNumber }

  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi'];

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full legal name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long.';
    }

    const cleanMobile = formData.mobile.trim().replace(/[\s-]/g, '');
    if (!cleanMobile) {
      newErrors.mobile = 'Mobile number is required.';
    } else if (!/^(?:\+?91|0)?[6-9]\d{9}$/.test(cleanMobile)) {
      newErrors.mobile = 'Enter a valid 10-digit Indian mobile number.';
    }

    const amountNum = parseFloat(formData.amount);
    if (!formData.amount) {
      newErrors.amount = 'Loan amount is required.';
    } else if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Amount must be a positive number.';
    }

    if (!formData.purpose) {
      newErrors.purpose = 'Please select a loan purpose.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error for this field
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleLanguageChange = (lang) => {
    setFormData((prev) => ({ ...prev, language: lang }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.submitApplication({
        name: formData.name,
        mobile: formData.mobile,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        language: formData.language
      });
      setSuccessData(response);
    } catch (err) {
      alert(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      mobile: '',
      amount: '',
      purpose: '',
      language: 'English'
    });
    setErrors({});
    setSuccessData(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row antialiased bg-surface text-on-surface">
      {/* Left Column - Intro Information */}
      <div className="w-full md:w-[40%] lg:w-2/5 bg-surface-container-low p-8 md:p-[80px] flex flex-col justify-between border-b md:border-b-0 md:border-r border-outline-variant/60">
        <div>
          {/* Logo Area */}
          <div className="flex items-center gap-2 text-primary mb-12 md:mb-[80px]">
            <span className="material-symbols-outlined text-[36px]" data-weight="fill">account_balance</span>
            <span className="text-2xl font-bold tracking-tight">Vitto</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 leading-tight text-on-surface">
            Apply for a Loan without typing.
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed mb-8 max-w-[400px]">
            Fast, secure, and available in your preferred local language. Fill in details to get started with our field agents.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px] text-primary">speed</span>
              </div>
              <div>
                <h3 className="font-semibold text-on-surface">Fast Processing</h3>
                <p className="text-sm text-on-surface-variant mt-1">Underwriting starts within 24 hours.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px] text-primary">security</span>
              </div>
              <div>
                <h3 className="font-semibold text-on-surface">Secure Database</h3>
                <p className="text-sm text-on-surface-variant mt-1">Your data is stored securely and never shared.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer and link to Admin dashboard for demo convenience */}
        <div className="mt-12 md:mt-[80px]">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-primary hover:text-primary-hover font-semibold text-sm flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">dashboard</span>
            Access Operations Dashboard
          </button>
          <div className="mt-4 text-xs text-on-surface-variant/60">
            © 2026 Vitto FinTech. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <main className="w-full md:w-[60%] lg:w-3/5 bg-surface-container-lowest p-8 md:p-[80px] flex items-center justify-center min-h-screen">
        <div className="w-full max-w-[560px]">
          {!successData ? (
            <div className="transition-all duration-300">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-2">
                  Application Details
                </h2>
                <p className="text-on-surface-variant">
                  Submit your loan request securely in your preferred language.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Language Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Preferred Language
                  </label>
                  <div className="flex flex-wrap gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/60 w-fit">
                    {languages.map((lang) => (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          formData.language === lang
                            ? 'bg-surface-container-lowest text-primary shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="name" className="text-xs font-semibold text-primary">
                    Applicant Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full legal name"
                    className="w-full border-0 border-b-2 border-outline-variant bg-transparent py-3 text-lg text-on-surface focus:ring-0 focus:border-primary transition-colors placeholder:text-on-surface-variant/40"
                    required
                  />
                  {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Mobile */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="mobile" className="text-xs font-semibold text-primary">
                      Mobile Number
                    </label>
                    <div className="flex items-end border-b-2 border-outline-variant focus-within:border-primary transition-colors">
                      <span className="text-lg text-on-surface-variant pb-3 pr-2">+91</span>
                      <input
                        type="tel"
                        id="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="98765 43210"
                        className="w-full border-0 bg-transparent py-3 text-lg text-on-surface focus:ring-0 placeholder:text-on-surface-variant/40"
                        required
                      />
                    </div>
                    {errors.mobile && <p className="text-xs text-error mt-1">{errors.mobile}</p>}
                  </div>

                  {/* Loan Amount */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="amount" className="text-xs font-semibold text-primary">
                      Loan Amount (₹)
                    </label>
                    <div className="flex items-end border-b-2 border-outline-variant focus-within:border-primary transition-colors">
                      <span className="text-lg text-on-surface-variant pb-3 pr-2">₹</span>
                      <input
                        type="number"
                        id="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="50,000"
                        className="w-full border-0 bg-transparent py-3 text-lg text-on-surface focus:ring-0 placeholder:text-on-surface-variant/40"
                        required
                      />
                    </div>
                    {errors.amount && <p className="text-xs text-error mt-1">{errors.amount}</p>}
                  </div>
                </div>

                {/* Loan Purpose */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="purpose" className="text-xs font-semibold text-primary">
                    Loan Purpose
                  </label>
                  <div className="relative">
                    <select
                      id="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className="w-full border-0 border-b-2 border-outline-variant bg-transparent py-3 text-lg text-on-surface appearance-none focus:ring-0 focus:border-primary transition-colors placeholder:text-on-surface-variant/40"
                      required
                    >
                      <option value="" disabled>Select the primary purpose</option>
                      <option value="Agriculture / Crop Cultivation">Agriculture / Crop Cultivation</option>
                      <option value="Business Expansion / Kirana Shop">Business Expansion / Kirana Shop</option>
                      <option value="Livestock Purchase (Dairy/Poultry)">Livestock Purchase (Dairy/Poultry)</option>
                      <option value="Home Renovation / Construction">Home Renovation / Construction</option>
                      <option value="Education / Medical Expenses">Education / Medical Expenses</option>
                      <option value="Other">Other</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
                      expand_more
                    </span>
                  </div>
                  {errors.purpose && <p className="text-xs text-error mt-1">{errors.purpose}</p>}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-on-primary rounded-lg py-4 font-semibold text-md hover:bg-primary-hover transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                  <p className="text-center text-xs text-on-surface-variant mt-4 flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    Your information is secured with bank-grade encryption
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-8 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-tertiary-container flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[40px] text-tertiary" data-weight="fill">
                  check_circle
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-2">
                Application Submitted!
              </h2>
              <p className="text-on-surface-variant max-w-[400px] leading-relaxed mb-8">
                Thank you for your loan request. Our underwriters will review the details and contact you shortly.
              </p>

              <div className="bg-surface-container-low rounded-xl border border-outline-variant/60 p-6 w-full max-w-[360px] mb-8 flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                  Reference Number
                </span>
                <span className="text-xl font-bold text-primary font-mono bg-surface-container-lowest px-4 py-2 rounded border border-outline-variant/40 tracking-widest">
                  {successData.referenceNumber}
                </span>
              </div>

              <button
                onClick={handleReset}
                className="text-primary hover:text-primary-hover font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
                <span className="border-b border-primary/30 pb-0.5">Submit Another Application</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Apply;
