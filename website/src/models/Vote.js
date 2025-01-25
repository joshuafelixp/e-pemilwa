import mongoose from 'mongoose'

const voteSchema = new mongoose.Schema({
    voteID: {
        type: String,
        required: true,
        unique: true,
    },
    voteCandidate: {
        type: Number,
        required: true,
    },
    createdTime: {
        type: Date,
        required: true,
        default: new Date()
    },
    isValid: {
        type: Boolean,
        required: true,
        default: false
    },
})

const Vote = mongoose.model('Vote', voteSchema)

export default Vote