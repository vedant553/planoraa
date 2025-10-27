export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Trip {
  _id: string;
  name: string;
  destination: string;
  tripImage?: string;
  dates: {
    start: string;
    end: string;
  };
  createdBy: string | User;
  members: Array<string | User>;
  activities?: Activity[];
  expenses?: Expense[];
  settlements?: Settlement[];
  polls?: Poll[];
}

export interface Activity {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  dateTime: string;
  createdBy: string | User;
}

export interface Expense {
  _id: string;
  description: string;
  amount: number;
  paidBy: string | User;
  date: string;
  splitDetails: Array<{
    user: string | User;
    owes: number;
  }>;
}

export interface Settlement {
  _id: string;
  from: string | User;
  to: string | User;
  amount: number;
  date: string;
  status: 'pending' | 'confirmed';
}

export interface Poll {
  _id: string;
  question: string;
  description?: string;
  createdBy: string | User;
  votes: Array<{
    user: string | User;
    voteType: 'upvote' | 'downvote';
  }>;
}

export interface Balance {
  [userId: string]: number;
}
