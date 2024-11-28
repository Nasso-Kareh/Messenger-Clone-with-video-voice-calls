import bcrypt from "bcrypt"; // Library for hashing passwords.
import prisma from "@/app/libs/prismadb"; // Prisma client for database interaction.
import { NextResponse } from "next/server"; // Helper for creating HTTP responses in Next.js API routes.

export async function POST(request: Request) {
  // Parse the incoming JSON body from the request.
  const body = await request.json();
  const { email, name, password } = body;

  // Hash the password using bcrypt with a salt round of 12 for security.
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create a new user in the database with the provided details.
  const user = await prisma.user.create({
    data: {
      email, // The user's email address.
      name, // The user's name.
      hashedPassword, // The securely hashed password.
    },
  });

  // Return the created user as a JSON response.
  return NextResponse.json(user);
}
