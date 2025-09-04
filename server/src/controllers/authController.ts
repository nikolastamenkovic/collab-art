import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { LoginReq, LoginRes, UserCreationReq, UserCreationRes } from "../types/auth";
import bcrypt from "bcrypt";
import { generateToken } from "../auth/jwtUtils";

const userRepository = AppDataSource.getRepository(User);

export const login = async (req: Request, res: Response) => {
  try {
    const loginReq: LoginReq = req.body;

    if (req.headers.authorization) {
      return res.status(401).json({ failed: true, code: "LOGGED_IN" });
    }

    const user = await userRepository.findOneBy({ username: loginReq.username });

    if (!user) {
      return res.status(404).json({ failed: true, code: "INCORRECT_CREDENTIALS" });
    }

    const isPasswordValid = await bcrypt.compare(loginReq.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ failed: true, code: "INCORRECT_CREDENTIALS" });
    }

    const token = generateToken(user.id, user.username);
    const loginRes: LoginRes = {
      failed: false,
      token: token,
      user_id: user.id,
      username: user.username,
    };
    res.status(200).json(loginRes);
  } catch (error) {
    res.status(500).json({ failed: true, code: "INTERNAL_ERROR" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {

    if (req.headers.authorization) {
      return res.status(401).json({ failed: true, code: "LOGGED_IN" });
    }

    const userCreationReq: UserCreationReq = req.body;

    const existingUser = await userRepository.findOneBy({ username: userCreationReq.username });
    if (existingUser) {
      return res.status(409).json({ failed: true, code: "DUPLICATE_USERNAME" });
    }

    const hashedPassword = await bcrypt.hash(userCreationReq.password, 10);

    const newUser = userRepository.create({ ...userCreationReq, password: hashedPassword });
    const savedUser = await userRepository.save(newUser); // Čuva korisnika u bazi

    const userCreationRes: UserCreationRes = {
      failed: false,
      user_id: savedUser.id
    };

    res.status(201).json(userCreationRes);
  } catch (error) {
    res.status(500).json({ failed: true, code: "INTERNAL_ERROR" });
  }
};
