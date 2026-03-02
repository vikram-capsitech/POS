export interface UserInterface {
  designation: string;
  _id: string;
  pic: string;
  userName: string;
  email: string;
  role: any;
  title: string;
  phone: any;
  displayName: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  about: string;
  social: string[];
  userStatus: string;
  dob: Date;
}
export interface BugInterface {
  _id: string;
  title: string;
  description: string;
  status: string;
  organizationId: string;
  raisedBY: string;
  createdAt: Date;
  updatedAt: Date;
  type: string;
}

export interface DiscussionInterface {
  _id: string;
  title: string;
  sender: string;
  organization: string;
  message: string;
}
