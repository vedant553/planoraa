import express from 'express';
import { body } from 'express-validator';
import {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addTripMember,
} from '../controllers/tripController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create trip
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('destination').notEmpty().withMessage('Destination is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    validate,
  ],
  createTrip
);

// Get all user trips
router.get('/', getUserTrips);

// Get single trip
router.get('/:tripId', getTripById);

// Update trip
router.put('/:tripId', updateTrip);

// Delete trip
router.delete('/:tripId', deleteTrip);

// Add member
router.post('/:tripId/members', addTripMember);

export default router;
