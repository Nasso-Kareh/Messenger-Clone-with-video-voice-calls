import { NextApiRequest, NextApiResponse } from "next"; // Import types for Next.js API routes.
import { getServerSession } from "next-auth"; // Function to get the current session using NextAuth.
import { pusherServer } from "@/app/libs/pusher"; // Import the configured Pusher server instance.
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Import NextAuth authentication options.

export default async function handler(
    request: NextApiRequest, // The incoming request object.
    response: NextApiResponse // The outgoing response object.
) {
    // Fetch the current user session from the request using the NextAuth configuration (authOptions).
    const session = await getServerSession(request, response, authOptions);

    // Check if the session is valid and the user has an email associated with it.
    if (!session?.user?.email) {
        return response.status(401); // If not, return a 401 Unauthorized status.
    }

    // Extract the `socket_id` and `channel_name` from the request body.
    const socketId = request.body.socket_id;
    const channel = request.body.channel_name;

    // Prepare the data object with the user's email for Pusher authorization.
    const data = {
        user_id: session.user.email, // Use the user's email as their unique identifier.
    };

    // Use Pusher's `authorizeChannel` method to authorize the user to join the specified channel.
    const authResponse = pusherServer.authorizeChannel(socketId, channel, data);

    // Send the Pusher authorization response back to the client.
    return response.send(authResponse);
}
