Messenger Clone
A real-time chat application with authentication, messaging, and dynamic conversations built using modern web technologies.

Table of Contents

Project Overview
Prerequisites
Installation
API Endpoints
Database Schema
Third-Party Libraries and Tools
Running and Testing
Project Overview

This project is a real-time messaging platform featuring:

Authentication (OAuth via GitHub and Google, or email/password).
Real-time chat powered by Pusher.
Image and media management via Cloudinary.
Dynamic creation and management of conversations.

Prerequisites
Ensure you have the following installed:

Node.js (v16 or above)
npm (comes with Node.js)
MongoDB Atlas or a local MongoDB instance
Pusher and Cloudinary accounts for real-time updates and media management

Installation
Clone the repository:

git clone https://github.com/Nasso-Kareh/Messenger-Clone-with-video-voice-calls.git
cd messenger-clone

Install dependencies:

npm install
Set up environment variables: Create a .env file in the root directory with the following:

DATABASE_URL=<Your MongoDB connection string>
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<Your NextAuth secret>
GITHUB_ID=<Your GitHub App client ID>
GITHUB_SECRET=<Your GitHub App client secret>
GOOGLE_CLIENT_ID=<Your Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<Your Google OAuth client secret>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<Your Cloudinary cloud name>
PUSHER_APP_ID=<Your Pusher app ID>
NEXT_PUBLIC_PUSHER_APP_KEY=<Your Pusher app key>
PUSHER_APP_SECRET=<Your Pusher app secret>
Run the development server:

npm run dev
Open http://localhost:3000 in your browser.

API Endpoints

Authentication Endpoints

Route: /api/auth/[...nextauth]
Handles user authentication using NextAuth.

Supports:
GitHub
Google
Email/password (credentials)

Messaging Endpoints
Route: /api/messages
POST: Create a new message in a conversation.
Request Body:

{
  "message": "Hello, world!",
  "image": "image-url",
  "conversationId": "conversation-object-id"
}

Response:

{
  "id": "message-object-id",
  "body": "Hello, world!",
  "createdAt": "2024-11-17T10:00:00Z",
  ...
}

Other Endpoints

/api/conversations: Manage conversations.
/api/register: Register a new user.
/api/settings: Update user settings.

Database Schema
This application uses Prisma as the ORM and MongoDB for data storage.

Models

User

Stores user information, including OAuth credentials and messages.
Key Fields: name, email, hashedPassword, emailVerified.

Conversation

Represents chats between users or groups.
Key Fields: isGroup, name, messages.

Message

Stores chat messages with optional images.
Key Fields: body, image, sender.

Account

Handles OAuth provider details.
Key Fields: provider, providerAccountId.

Third-Party Libraries and Tools

NextAuth: Authentication with GitHub, Google, and credentials.
Prisma: ORM for database operations.
Pusher: Real-time messaging and updates.
Cloudinary: Media storage for images.
Tailwind CSS: UI styling.
React: Frontend framework for dynamic components.
Axios: Simplified HTTP requests.
Zustand: State management.

Running and Testing
Running Locally
Ensure MongoDB and Pusher configurations are correctly set in .env.

Start the development server:

npm run dev

Testing Features
Authentication: Log in using GitHub, Google, or email/password.
Messaging: Create new messages and see real-time updates in active conversations.
Error Handling: Includes input validation and unauthorized request handling.
