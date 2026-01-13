export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthContext = {
  user: AuthUser;
  roles: string[];
  privileges: string[];
};


