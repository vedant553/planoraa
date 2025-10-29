import mongoose, { Document, Schema } from 'mongoose';

export enum TripStatus {
  PLANNING = 'PLANNING',
  CONFIRMED = 'CONFIRMED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface ITrip extends Document {
  title: string;
  description?: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  coverImage?: string;
  budget?: number;
  currency: string;
  status: TripStatus;
  owner: mongoose.Types.ObjectId;
  members: Array<{
    user: mongoose.Types.ObjectId;
    role: string;
    status: string;
    joinedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    coverImage: String,
    budget: Number,
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: Object.values(TripStatus),
      default: TripStatus.PLANNING,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['OWNER', 'ADMIN', 'EDITOR', 'MEMBER', 'VIEWER'],
          default: 'MEMBER',
        },
        status: {
          type: String,
          enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
          default: 'PENDING',
        },
        joinedAt: {
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

// Indexes
TripSchema.index({ owner: 1 });
TripSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model<ITrip>('Trip', TripSchema);
