export interface IUser {
  username: string;
  password: string;
  matchPassword(candidatePassword: string): Promise<boolean>;
}
