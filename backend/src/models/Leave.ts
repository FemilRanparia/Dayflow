import mongoose, { Document, Schema } from 'mongoose';

export interface ILeave extends Document {
  employeeId: string;
  userId: mongoose.Types.ObjectId;
  leaveType: 'paid' | 'sick' | 'unpaid';
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approverComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const leaveSchema = new Schema<ILeave>(
  {
    employeeId: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['paid', 'sick', 'unpaid'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approverComments: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILeave>('Leave', leaveSchema);
