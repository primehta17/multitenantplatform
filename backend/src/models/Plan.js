import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    billingCycle: { type: String, enum: ['monthly', 'annual'], required: true },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
