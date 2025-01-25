import 'dotenv/config'

import mongoose from 'mongoose'
const db = process.env.MONGOURL

main()

async function main() {
    try {
        await mongoose.connect(db)
        console.log('Connected to MongoDB')
    } catch (error) {
        return console.log(error)
    }
}

