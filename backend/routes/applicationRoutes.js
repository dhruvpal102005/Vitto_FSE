import express from 'express';
import {
  createApplication,
  getApplications,
  updateApplicationStatus,
  getSummary
} from '../controllers/applicationController.js';
import {
  validateApplication,
  validateStatus
} from '../middleware/validate.js';

const router = express.Router();

router.post('/applications', validateApplication, createApplication);
router.get('/applications', getApplications);
router.patch('/applications/:id/status', validateStatus, updateApplicationStatus);
router.get('/summary', getSummary);

export default router;
