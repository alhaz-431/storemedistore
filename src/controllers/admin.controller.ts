import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isBanned } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: { isBanned },
  });

  res.json(user);
};