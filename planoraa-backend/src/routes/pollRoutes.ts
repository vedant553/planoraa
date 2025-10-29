import express from 'express';
import {
  createPoll,
  getTripPolls,
  votePoll,
  closePoll,
} from '../controllers/pollController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.post('/trips/:tripId/polls', createPoll);
router.get('/trips/:tripId/polls', getTripPolls);
router.post('/polls/:pollId/vote', votePoll);
router.put('/polls/:pollId/close', closePoll);

export default router;
