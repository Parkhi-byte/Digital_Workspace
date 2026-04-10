import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            required: true,
            // Examples: 'USER_SUSPENDED', 'USER_ACTIVATED', 'TEAM_DELETED', 'TEAM_OWNERSHIP_TRANSFERRED', 'ROLE_CHANGED'
        },
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        targetTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
        },
        details: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
