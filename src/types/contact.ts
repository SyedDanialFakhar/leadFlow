export interface HunterResult {
  email: string;
  score: number;
  firstName: string;
  lastName: string;
  position: string;
  sources: number;
}

export interface ApolloResult {
  email: string;
  firstName: string;
  lastName: string;
  title: string;
  phone: string | null;
  linkedinUrl: string | null;
  companyName: string;
  employeeCount: number | null;
}
