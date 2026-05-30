export const validateApplication = (req, res, next) => {
  const { name, mobile, amount, purpose, language } = req.body;
  const errors = {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.name = 'Applicant name must be at least 2 characters long.';
  }

  // Indian mobile validation (10 digits, optional leading +91 or 91 or 0)
  const mobileStr = mobile ? String(mobile).trim() : '';
  const cleanMobile = mobileStr.replace(/[\s-]/g, '');
  if (!cleanMobile || !/^(?:\+?91|0)?[6-9]\d{9}$/.test(cleanMobile)) {
    errors.mobile = 'Mobile number must be a valid 10-digit Indian phone number.';
  }

  const parsedAmount = parseFloat(amount);
  if (amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.amount = 'Loan amount must be a positive number.';
  }

  if (!purpose || typeof purpose !== 'string' || purpose.trim().length < 5) {
    errors.purpose = 'Loan purpose must be at least 5 characters long.';
  }

  const allowedLanguages = ['Hindi', 'Tamil', 'Telugu', 'Marathi', 'English'];
  if (!language || !allowedLanguages.includes(language)) {
    errors.language = `Preferred language must be one of: ${allowedLanguages.join(', ')}.`;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  req.validatedData = {
    name: name.trim(),
    mobile: cleanMobile,
    amount: parsedAmount,
    purpose: purpose.trim(),
    language
  };

  next();
};

export const validateStatus = (req, res, next) => {
  const { status } = req.body;
  const allowedStatuses = ['approved', 'rejected'];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}.`
    });
  }

  next();
};
