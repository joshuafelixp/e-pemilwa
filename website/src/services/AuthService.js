import 'dotenv/config'
import voterModel from '../models/Voter.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const secret = process.env.SECRET

export const login = async (nimData, passwordData) => {
    try {
        const registeredVoter = await voterModel.findOne({ nim: nimData })
        if (!registeredVoter) {
            throw new Error('Nim atau Password salah!')
        }
        const isPasswordValid = bcrypt.compareSync(passwordData, registeredVoter.password)
        if (!isPasswordValid) {
            throw new Error('Password salah!')
        }
        const token = jwt.sign({ nim: registeredVoter.nim }, secret, { expiresIn: '1d' })
        return token
    } catch (error) {
        throw error
    }
}

export const checkRole = (loginData) => {
    if (loginData.username != null) {
        return 'admin'
    } else {
        return 'voter'
    }
}