import prisma from "@/app/libs/prismadb"; // Import Prisma client for database interaction.
import getCurrentUser from "./getCurrentUser"; // Helper function to fetch the current user.

/**
 * Fetches all conversations for the currently authenticated user.
 *
 * @returns An array of conversation objects sorted by the most recent message, or an empty array if the user is not authenticated or no conversations exist.
 */
const getConversations = async () => {
  // Retrieve the currently authenticated user.
  const currentUser = await getCurrentUser();

  // If no user is authenticated, return an empty array.
  if (!currentUser?.id) {
    return [];
  }

  try {
    // Query the database to retrieve conversations.
    const conversations = await prisma.conversation.findMany({
      orderBy: {
        lastMessageAt: "desc", // Sort conversations by the timestamp of the last message in descending order.
      },
      where: {
        userIds: {
          has: currentUser.id, // Fetch conversations where the current user's ID is included in the userIds array.
        },
      },
      include: {
        users: true, // Include details about users in each conversation.
        messages: {
          include: {
            sender: true, // Include details about the sender of each message.
            seen: true,   // Include details about users who have seen each message.
          },
        },
      },
    });

    // Return the fetched conversations.
    return conversations;
  } catch (error: any) {
    // Handle any errors by returning an empty array.
    return [];
  }
};

export default getConversations;
