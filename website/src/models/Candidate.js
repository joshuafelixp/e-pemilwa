import mongoose from 'mongoose'
const candidateSchema = new mongoose.Schema({
    candidateNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    presidentName: {
        type: String,
        required: true,
    },
    vpresidentName: {
        type: String,
        required: true,
    },
    candidateImage: {
        type: String,
        required: true,
    },
})

const Candidate = mongoose.model('Candidate', candidateSchema)

export default Candidate