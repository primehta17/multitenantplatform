import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
