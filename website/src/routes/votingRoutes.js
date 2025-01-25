import express from 'express'
import { getVoting, postVoting } from '../controllers/VotingController.js'
import { auth } from '../middlewares/AuthMiddleware.js'

const router = express.Router()

router.get('/voting', auth, getVoting)
router.post('/voting', auth, postVoting)

export default router