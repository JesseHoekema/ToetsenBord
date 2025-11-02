import { prisma } from '$lib/prisma';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

export interface AuthResult {
  success: boolean;
  userId?: number;
  token?: string;
  message?: string;
}

export async function registerWithEmail(name: string, email: string, password: string): Promise<AuthResult> {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { success: false, message: 'Email already in use' };
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.session.create({ data: { token, userId: user.id, expiresAt } });
    return { success: true, userId: user.id, token };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function loginWithPassword(email: string, password: string): Promise<AuthResult> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, message: 'User not found' };
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return { success: false, message: 'Incorrect password' };
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.session.create({ data: { token, userId: user.id, expiresAt } });
    return { success: true, userId: user.id, token };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function getUserFromCookie(cookie: string): Promise<{
  id: number;
  name: string;
  email: string;
  somtodayToken: string | null;
  expiresAt: Date;
  profilePicture: String | null;
} | null> {
  try {
    const session = await prisma.session.findUnique({
      where: { token: cookie },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) return null;

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      somtodayToken: session.user.somtodayToken,
      expiresAt: session.expiresAt,
      profilePicture: session.user.profilePicture
    };
  } catch {
    return null;
  }
}

export async function changePassword(userId: number, oldPassword: string, newPassword: string): Promise<AuthResult> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: 'User not found' };
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) return { success: false, message: 'Verkeerd oud wachtwoord' };
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function changeUserInfo(userId: number, name: string, email: string): Promise<AuthResult> {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) return { success: false, message: 'Email already in use' };
    await prisma.user.update({ where: { id: userId }, data: { name, email } });
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function deleteAccount(userId: number): Promise<AuthResult> {
  try {
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}