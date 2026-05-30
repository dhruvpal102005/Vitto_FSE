import pool from '../config/db.js';

// POST /api/applications
export const createApplication = async (req, res, next) => {
  const { name, mobile, amount, purpose, language } = req.validatedData;

  try {
    const query = `
      INSERT INTO applications (name, mobile, amount, purpose, language)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [name, mobile, amount, purpose, language]);
    const application = result.rows[0];

    // Reference number can be a short custom format or the full UUID
    const referenceNumber = `VT-${application.id.split('-')[0].toUpperCase()}`;

    res.status(201).json({
      message: 'Application submitted successfully',
      referenceNumber,
      application
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/applications
export const getApplications = async (req, res, next) => {
  const { status, search } = req.query;

  try {
    let queryText = 'SELECT * FROM applications';
    const queryParams = [];
    const conditions = [];

    if (status) {
      queryParams.push(status);
      conditions.push(`status = $${queryParams.length}`);
    }

    if (search) {
      const searchPattern = `%${search.trim()}%`;
      queryParams.push(searchPattern);
      conditions.push(`(name ILIKE $${queryParams.length} OR mobile ILIKE $${queryParams.length})`);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await pool.query(queryText, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/applications/:id/status
export const updateApplicationStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const query = `
      UPDATE applications
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(200).json({
      message: `Application status updated to ${status}`,
      application: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/summary
export const getSummary = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        COUNT(*) AS total_applications,
        COALESCE(SUM(amount), 0) AS total_amount_requested,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved_count,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count
      FROM applications
    `;
    const result = await pool.query(query);
    const stats = result.rows[0];

    res.status(200).json({
      totalApplications: parseInt(stats.total_applications, 10),
      totalAmountRequested: parseFloat(stats.total_amount_requested),
      pendingCount: parseInt(stats.pending_count, 10),
      approvedCount: parseInt(stats.approved_count, 10),
      rejectedCount: parseInt(stats.rejected_count, 10)
    });
  } catch (error) {
    next(error);
  }
};
