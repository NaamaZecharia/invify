import mongoose, { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import type { IUser } from '../types/user.js';

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
});


userSchema.pre('save', async function () {
  if (!this.isModified('password')) return; 

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = model<IUser>('User', userSchema);

export default User;
