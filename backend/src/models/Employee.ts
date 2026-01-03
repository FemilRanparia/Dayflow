import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    gender?: string;
    phone?: string;
    address?: string;
    profilePicture?: string;
  };
  jobDetails: {
    designation?: string;
    department?: string;
    joiningDate?: Date;
    employmentType?: string;
  };
  documents: Array<{
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    personalDetails: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      dateOfBirth: Date,
      gender: String,
      phone: String,
      address: String,
      profilePicture: String,
    },
    jobDetails: {
      designation: String,
      department: String,
      joiningDate: Date,
      employmentType: String,
    },
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEmployee>('Employee', employeeSchema);
