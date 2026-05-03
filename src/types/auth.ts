export type AuthUser = {
  userId: string;
  email: string;
  role: "ADMIN" | "SELLER" | "CUSTOMER";
};