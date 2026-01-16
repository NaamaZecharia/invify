import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import { prisma } from "../prisma";
import { generateToken } from '../utils/generateToken';
import { hashPassword, matchPassword } from '../utils/hash';


export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const userExists = await prisma.user.findUnique({ where: {username} });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

   const hashedPassword = await hashPassword(password);

   const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  res.status(201).json({
    _id: user.id,
    username: user.username,
    token: generateToken(user.id),
  });
});


export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({where: { username } });

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  res.json({
    id: user.id,
    username: user.username,
    token: generateToken(user.id),
  });
});
