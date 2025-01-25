import mongoose from 'mongoose'
const resultSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: 'recapTime'
      },
    lastRecapTime: {
        type: Date,
        required: true,
        default: null
    },
    lastTotalVotes: {
        type: Number,
        required: true,
        default: 0
    },
})

const Result = mongoose.model('Result', resultSchema)

export default Result