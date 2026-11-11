export interface UserSummary {
  id: number;
  name: string;
}

export interface User extends UserSummary {
  email: string;
  age: number;
  country: { id: number; name: string } | null;
  roles: { id: number; name: string }[];
}
