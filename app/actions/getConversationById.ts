import prisma from "@/app/libs/prismadb"; // Import Prisma client for database interaction.
import getCurrentUser from "./getCurrentUser"; // Helper function to fetch the current user.

/**
 * Fetches a specific conversation by its ID.
 *
 * @param conversationId - The unique ID of the conversation to retrieve.
 * @returns The conversation object with associated users if found, otherwise null.
 */
const getConversationById = async (conversationId: string) => {
  try {
    // Fetch the currently authenticated user.
    const currentUser = await getCurrentUser();

    // Ensure the user is authenticated by checking their email.
    if (!currentUser?.email) {
      return null; // If not authenticated, return null.
    }

    // Query the database for the conversation with the provided ID.
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId, // Match the conversation by its unique ID.
      },
      include: {
        users: true, // Include associated user details in the query result.
      },
    });

    // Return the fetched conversation.
    return conversation;
  } catch (error: any) {
    // Handle any errors that occur during the query process.
    return null; // If an error occurs, return null.
  }
};

export default getConversationById;
