import express from 'express';
import {
  createActivity,
  getTripActivities,
  updateActivity,
  deleteActivity,
} from '../controllers/activityController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.post('/trips/:tripId/activities', createActivity);
router.get('/trips/:tripId/activities', getTripActivities);
router.put('/activities/:activityId', updateActivity);
router.delete('/activities/:activityId', deleteActivity);

export default router;
