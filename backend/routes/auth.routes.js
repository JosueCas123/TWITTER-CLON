import express from 'express'
import { login, logout, signup } from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/singup', signup)

router.post('/login',login)

router.get('/logout', logout)

export default router