import getCurrentUser from "@/app/actions/getCurrentUser"; // Utility function to get the currently authenticated user.
import { NextResponse } from "next/server"; // Helper for creating HTTP responses in Next.js API routes.
import prisma from "@/app/libs/prismadb"; // Prisma client for database interactions.
import { pusherServer } from "@/app/libs/pusher"; // Pusher server instance for real-time notifications.

export async function POST(request: Request) {
  try {
    // Retrieve the currently authenticated user.
    const currentUser = await getCurrentUser();

    // Parse the JSON body of the incoming request.
    const body = await request.json();
    const { userId, isGroup, members, name } = body;

    // If the user is not authenticated, return a 401 Unauthorized response.
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate group creation requirements.
    // Groups must have at least two members and a name.
    if (isGroup && (!members || members.length < 2 || !name)) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    // Handle group conversation creation.
    if (isGroup) {
      // Create a new group conversation in the database.
      const newConversation = await prisma.conversation.create({
        data: {
          name, // Name of the group.
          isGroup, // Indicates that this is a group conversation.
          users: {
            connect: [
              // Connect all members to the conversation.
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
              // Include the current user as a participant.
              {
                id: currentUser.id,
              },
            ],
          },
        },
        include: {
          users: true, // Include user details in the response.
        },
      });

      // Notify all users in the group about the new conversation.
      newConversation.users.forEach((user) => {
        if (user.email) {
          pusherServer.trigger(user.email, "conversation:new", newConversation);
        }
      });

      // Return the created conversation as a JSON response.
      return NextResponse.json(newConversation);
    }

    // Check if a one-on-one conversation already exists.
    const existingConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          // Match conversations where the current user and the other user are participants.
          {
            userIds: {
              equals: [currentUser.id, userId],
            },
          },
          {
            userIds: {
              equals: [userId, currentUser.id],
            },
          },
        ],
      },
    });

    // If a one-on-one conversation already exists, return it.
    const singleConversation = existingConversations[0];
    if (singleConversation) {
      return NextResponse.json(singleConversation);
    }

    // Create a new one-on-one conversation if it doesn't exist.
    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [
            { id: currentUser.id }, // Connect the current user.
            { id: userId }, // Connect the other user.
          ],
        },
      },
      include: {
        users: true, // Include user details in the response.
      },
    });

    // Notify both users about the new conversation.
    newConversation.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, "conversation:new", newConversation);
      }
    });

    // Return the created conversation as a JSON response.
    return NextResponse.json(newConversation);
  } catch (error: any) {
    // If an error occurs, return a 500 Internal Server Error response.
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
