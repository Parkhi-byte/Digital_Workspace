
import mongoose from 'mongoose';

const eventSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        allDay: { type: Boolean, default: false },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
        isGlobal: { type: Boolean, default: false },
        description: { type: String },
        color: { type: String, default: '#3b82f6' }, // Default blue
    },
    { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;
