import { Controller, Get, Req, Res, UseGuards, BadRequestException } from "@nestjs/common";
import { Request, Response } from "express";
import { GoogleAuthGuard } from "./utils/Guards";
import * as jwt from 'jsonwebtoken';
import { User } from '../types/user';

@Controller("auth")
export class AuthController {
  @Get("google/login")
  @UseGuards(GoogleAuthGuard)
  handleLogin(@Res() res: Response) {}

  @Get("google/redirect")
  @UseGuards(GoogleAuthGuard)
  handleRedirect(@Req() req: Request, @Res() res: Response) {
    if (!req.user) throw new BadRequestException("Authentication failed");
    
    const user = req.user as User;
    const token = jwt.sign(
      { id: user.id, displayName: user.displayName, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.cookie('jwt', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 3600000
    });
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }

  @Get("google/logout")
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      res.clearCookie('jwt');
      res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
      res.status(500).json({ message: "Logout error", error: err });
    }
  }

  @Get("me")
  getUser(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies['jwt'];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string; displayName: string; email: string };
      res.status(200).json(decoded);
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  }
}