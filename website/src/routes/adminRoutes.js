import express from 'express'
import { getAddAdmin, getAdmin, getAdminIntegrity, getAdminLogin, getAdminLogout, getAdminResult, getManageAdmin, postAdminLogin, postAdminResult } from '../controllers/AdminController.js'
import { authAdmin, isLogin } from '../middlewares/AuthMiddleware.js'

const router = express.Router()

router.get('/admin/login', isLogin, getAdminLogin)
router.post('/admin/login', isLogin, postAdminLogin)
router.get('/admin/logout', authAdmin, getAdminLogout)

router.get('/admin', authAdmin, getAdmin)
router.get('/admin/admin', authAdmin, getManageAdmin)
router.get('/admin/admin/add', authAdmin, getAddAdmin)
router.get('/admin/result', authAdmin, getAdminResult)
router.post('/admin/result', authAdmin, postAdminResult)

router.get('/admin/integrity', authAdmin, getAdminIntegrity)

export default router