import bcrypt from "bcrypt"; // Library for hashing and comparing passwords.
import NextAuth, { AuthOptions } from "next-auth"; // NextAuth for authentication handling.
import CredentialsProvider from "next-auth/providers/credentials"; // For custom email/password authentication.
import GithubProvider from "next-auth/providers/github"; // OAuth provider for GitHub.
import GoogleProvider from "next-auth/providers/google"; // OAuth provider for Google.
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // Adapter for integrating NextAuth with Prisma.

import prisma from "@/app/libs/prismadb"; // Prisma client for database interaction.

// NextAuth configuration options
export const authOptions: AuthOptions = {
  // Use the Prisma adapter to connect NextAuth with the database.
  adapter: PrismaAdapter(prisma),

  // Authentication providers configuration.
  providers: [
    // GitHub OAuth provider.
    GithubProvider({
      clientId: process.env.GITHUB_ID as string, // GitHub App client ID from environment variables.
      clientSecret: process.env.GITHUB_SECRET as string, // GitHub App client secret.
    }),

    // Google OAuth provider.
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string, // Google OAuth client ID from environment variables.
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, // Google OAuth client secret.
    }),

    // Credentials provider for custom email/password login.
    CredentialsProvider({
      name: "credentials", // Display name for the credentials form.
      credentials: {
        email: { label: "Email", type: "text" }, // Email input field in the login form.
        password: { label: "Password", type: "password" }, // Password input field in the login form.
      },
      async authorize(credentials) {
        // Validate that both email and password are provided.
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Fetch the user from the database using the provided email.
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // If the user is not found or does not have a hashed password, throw an error.
        if (!user || !user?.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        // Compare the provided password with the stored hashed password.
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        // If the password is incorrect, throw an error.
        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        // Return the user object if authentication is successful.
        return user;
      },
    }),
  ],

  // Enable debug mode in development to assist with troubleshooting.
  debug: process.env.NODE_ENV === "development",

  // Configure session strategy.
  session: {
    strategy: "jwt", // Use JSON Web Tokens (JWT) for session management.
  },

  // Secret key for signing JWTs and encrypting cookies.
  secret: process.env.NEXTAUTH_SECRET,
};

// Create the NextAuth handler using the defined configuration.
const handler = NextAuth(authOptions);

// Export the handler for GET and POST requests.
export { handler as GET, handler as POST };
