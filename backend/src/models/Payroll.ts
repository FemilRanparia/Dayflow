import mongoose, { Document, Schema } from 'mongoose';

export interface IPayroll extends Document {
  employeeId: string;
  userId: mongoose.Types.ObjectId;
  basicSalary: number;
  allowances: {
    hra?: number;
    transport?: number;
    medical?: number;
    other?: number;
  };
  deductions: {
    tax?: number;
    providentFund?: number;
    insurance?: number;
    other?: number;
  };
  netSalary: number;
  effectiveFrom: Date;
  createdAt: Date;
  updatedAt: Date;
}

const payrollSchema = new Schema<IPayroll>(
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
    basicSalary: {
      type: Number,
      required: true,
    },
    allowances: {
      hra: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    deductions: {
      tax: { type: Number, default: 0 },
      providentFund: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    netSalary: {
      type: Number,
      required: true,
    },
    effectiveFrom: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate net salary before saving
payrollSchema.pre('save', function (next) {
  const totalAllowances =
    (this.allowances.hra || 0) +
    (this.allowances.transport || 0) +
    (this.allowances.medical || 0) +
    (this.allowances.other || 0);

  const totalDeductions =
    (this.deductions.tax || 0) +
    (this.deductions.providentFund || 0) +
    (this.deductions.insurance || 0) +
    (this.deductions.other || 0);

  this.netSalary = this.basicSalary + totalAllowances - totalDeductions;
  next();
});

export default mongoose.model<IPayroll>('Payroll', payrollSchema);
