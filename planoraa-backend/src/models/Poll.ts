import mongoose, { Document, Schema } from 'mongoose';

export interface IPoll extends Document {
  trip: mongoose.Types.ObjectId;
  question: string;
  description?: string;
  type: string;
  deadline?: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  votes: Array<{
    user: mongoose.Types.ObjectId;
    voteType: 'upvote' | 'downvote';
    votedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const PollSchema = new Schema<IPoll>(
  {
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    question: {
      type: String,
      required: [true, 'Poll question is required'],
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['YES_NO', 'RATING'],
      default: 'YES_NO',
    },
    deadline: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    votes: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        voteType: {
          type: String,
          enum: ['upvote', 'downvote'],
          required: true,
        },
        votedAt: {
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
PollSchema.index({ trip: 1 });
PollSchema.index({ createdBy: 1 });

export default mongoose.model<IPoll>('Poll', PollSchema);
