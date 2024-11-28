import getCurrentUser from "@/app/actions/getCurrentUser"; // Importing a function to get the current logged-in user.
import { NextResponse } from "next/server"; // Helper for creating HTTP responses in Next.js API routes.
import prisma from "@/app/libs/prismadb"; // Prisma client for database interaction.

export async function POST(request: Request) {
  try {
    // Get the current logged-in user using the getCurrentUser function.
    const currentUser = await getCurrentUser();

    // Parse the incoming JSON body from the request to extract the user details (name, image).
    const body = await request.json();
    const { name, image } = body;

    // If the user is not authenticated (i.e., no user ID), return an "Unauthorized" response.
    if (!currentUser?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the current user's details (name and image) in the database using Prisma.
    const updateUser = await prisma.user.update({
      where: {
        id: currentUser.id, // Find the user by their ID.
      },
      data: {
        name, // The new name for the user.
        image, // The new image for the user.
      },
    });

    // Return the updated user as a JSON response.
    return NextResponse.json(updateUser);
  } catch (error: any) {
    // Log any errors for debugging purposes.
    console.log(error, "ERROR_Settings");

    // Return a "500 Internal Server Error" response if something goes wrong.
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
