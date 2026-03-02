export type EmployeeProfile = {
  _id: string;
  userID: string;
  organizationID: string;
  position: string; // "Employee"
  jobRole: string;  // "employee"
  employeeStatus: "active" | "inactive" | string;

  salary: number;
  salaryStatus: "Pending" | "Paid" | string;
  lastPaidAt: string | null;

  monthlyAdvanceTaken: number;
  monthlySalaryReceived: number;

  totalLeave: number;
  leaveTaken: number;
  leavesProvided: number;
  unauthorizedLeaves: number;

  coinsPerMonth: number;

  currentLocation: {
    latitude: number | null;
    longitude: number | null;
  };

  fcmToken: string | null;
  access: any[]; // replace with your permission type later

  hireDate: string; // ISO
  allotedItems: any[];

  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type Employee = {
  _id: string;

  profilePhoto: string | null;
  userName: string;
  email: string;
  displayName: string;

  gender: string | null;
  phoneNumber: string | null;
  dob: string | null;

  social: any[];

  systemRole: string | null;     // null for employee
  roleID: string | null;         // role document id
  organizationID: string;        // org id (string for employee case)

  loginAttempts: number;
  lockUntil: string | null;

  isEmailVerified: boolean;

  emailVerificationExpiry?: string | null;
  forgotPasswordExpiry?: string | null;

  temporaryToken: string | null;
  temporaryTokenExpiry: string | null;

  status: string; // "Online"
  theme: string;
  themeType: "light" | "dark" | string;

  fontFamily: string | null;
  sizeLevel: string;
  isSystemDefault: boolean;

  joinDate: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;

  profile?: EmployeeProfile; // present in your payload
};