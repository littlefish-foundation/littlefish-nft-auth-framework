import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import cookieParser from 'cookie-parser';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

app.post('/signup', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        
      }
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: "User could not be created." });
  }
});

app.post('/signin', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const jwtToken = await new jose.SignJWT({ userId: user.id.toString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

  res.cookie('jwt', jwtToken, { httpOnly: true, secure: true }); // Set secure: true in production
  res.status(200).json({ message: "Login successful!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
