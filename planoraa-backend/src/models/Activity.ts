import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  trip: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  startTime: Date;
  endTime?: Date;
  category: string;
  priority: string;
  status: string;
  notes?: string;
  cost?: number;
  bookingUrl?: string;
  sortOrder: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
    },
    description: String,
    location: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: Date,
    category: {
      type: String,
      enum: ['ACCOMMODATION', 'TRANSPORTATION', 'DINING', 'ATTRACTION', 'ENTERTAINMENT', 'SHOPPING', 'OTHER'],
      default: 'OTHER',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['PLANNED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      default: 'PLANNED',
    },
    notes: String,
    cost: Number,
    bookingUrl: String,
    sortOrder: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ActivitySchema.index({ trip: 1 });
ActivitySchema.index({ startTime: 1 });
ActivitySchema.index({ sortOrder: 1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);
