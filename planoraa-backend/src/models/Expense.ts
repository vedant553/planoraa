import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  trip: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  date: Date;
  receipt?: string;
  paidBy: mongoose.Types.ObjectId;
  participants: Array<{
    user: mongoose.Types.ObjectId;
    share: number;
    isPaid: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
    },
    description: String,
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    category: {
      type: String,
      enum: ['ACCOMMODATION', 'TRANSPORTATION', 'FOOD', 'ACTIVITIES', 'SHOPPING', 'OTHER'],
      default: 'OTHER',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    receipt: String,
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        share: {
          type: Number,
          required: true,
        },
        isPaid: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
ExpenseSchema.index({ trip: 1 });
ExpenseSchema.index({ paidBy: 1 });
ExpenseSchema.index({ date: -1 });

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
