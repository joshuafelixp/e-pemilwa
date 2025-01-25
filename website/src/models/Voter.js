import mongoose from 'mongoose'
const voterSchema = new mongoose.Schema({
    nim: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    faculty: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    hasVoted: {
        type: Boolean,
        required: true,
        default: false
    },
    voteTime: {
        type: Date,
        required: true,
        default: null
    },
})

const Voter = mongoose.model('Voter', voterSchema)

export default Voter