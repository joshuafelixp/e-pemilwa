import express from 'express'
import { auth, isLogin } from '../middlewares/AuthMiddleware.js'
import { getLogin, getLogout, postLogin } from '../controllers/AuthController.js'

const router = express.Router()

router.get('/login', isLogin, getLogin)
router.post('/login', isLogin, postLogin)
router.get('/logout', auth, getLogout)

export default router