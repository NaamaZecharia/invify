import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import  User  from '../models/user.js';
import { generateToken } from '../utils/generateToken.js';

// @desc Register new user
// @route POST /api/auth/register
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const userExists = await User.findOne({ username });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ username, password });

  res.status(201).json({
    _id: user._id,
    username: user.username,
    token: generateToken(user._id.toString()),
  });
});

// @desc Login user
// @route POST /api/auth/login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (user && await user.matchPassword(password)) {
    res.json({
      _id: user._id,
      username: user.username,
      token: generateToken(user._id.toString()),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});
