import express from 'express'
import { auth } from '../middlewares/AuthMiddleware.js'
import { getAccount, getDashboard, getVote } from '../controllers/DashboardController.js'

const router = express.Router()

router.get('/dashboard', auth, getDashboard)

router.get('/account', auth, getAccount)

router.get('/vote', auth, getVote)

export default router