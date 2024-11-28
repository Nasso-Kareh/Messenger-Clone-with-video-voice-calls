import getCurrentUser from "@/app/actions/getCurrentUser"; // Utility function to retrieve the current authenticated user.
import { NextResponse } from "next/server"; // Helper for creating HTTP responses in Next.js API routes.
import prisma from "@/app/libs/prismadb"; // Prisma client for database interaction.
import { pusherServer } from "@/app/libs/pusher"; // Pusher instance for real-time updates.

export async function POST(request: Request) {
  try {
    // Retrieve the current authenticated user.
    const currentUser = await getCurrentUser();

    // Parse the incoming JSON body from the request.
    const body = await request.json();
    const { message, image, conversationId } = body;

    // If the user is not authenticated, return a 401 Unauthorized response.
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create a new message in the database.
    const newMessage = await prisma.message.create({
      data: {
        body: message, // The text content of the message.
        image: image, // Optional image associated with the message.
        conversation: {
          connect: {
            id: conversationId, // Connect the message to the specified conversation.
          },
        },
        sender: {
          connect: {
            id: currentUser.id, // Associate the current user as the sender.
          },
        },
        seen: {
          connect: {
            id: currentUser.id, // Mark the message as seen by the sender.
          },
        },
      },
      include: {
        seen: true, // Include details of users who have seen the message.
        sender: true, // Include details of the sender.
      },
    });

    // Update the conversation to reflect the new message.
    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId, // Identify the conversation to update.
      },
      data: {
        lastMessageAt: new Date(), // Update the timestamp for the last message.
        messages: {
          connect: {
            id: newMessage.id, // Connect the new message to the conversation.
          },
        },
      },
      include: {
        users: true, // Include user details in the updated conversation.
        messages: {
          include: {
            seen: true, // Include details of users who have seen the messages.
          },
        },
      },
    });

    // Trigger a real-time event for the conversation to notify about the new message.
    await pusherServer.trigger(conversationId, "messages:new", newMessage);

    // Retrieve the last message in the conversation.
    const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

    // Notify all users in the conversation about the updated conversation details.
    updatedConversation.users.map((user) => {
      pusherServer.trigger(user.email!, "conversation:update", {
        id: conversationId, // Conversation ID.
        lastMessage: [lastMessage], // Details of the last message.
      });
    });

    // Return the created message as a JSON response.
    return NextResponse.json(newMessage);
  } catch (error: any) {
    // Log the error for debugging purposes.
    console.log(error, "Error Messages");

    // Return a 500 Internal Server Error response if something goes wrong.
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
