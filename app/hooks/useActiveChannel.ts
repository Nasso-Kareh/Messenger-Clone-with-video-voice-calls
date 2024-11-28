import { useEffect, useState } from "react"; // React hooks to manage state and side effects.
import useActiveList from "./useActiveList"; // Custom hook to manage the active list of users.
import { Channel, Members } from "pusher-js"; // Pusher types for channel and members.
import { pusherClient } from "../libs/pusher"; // Importing the configured Pusher client.

const useActiveChannel = () => {
    const { set, add, remove } = useActiveList(); // Destructuring functions from the custom `useActiveList` hook to manage active members.
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null); // State to store the Pusher channel.

    useEffect(() => {
        let channel = activeChannel; // Store the current active channel.

        // If there isn't an active channel yet, subscribe to the "presence-messenger" channel.
        if (!channel) {
            channel = pusherClient.subscribe("presence-messenger"); 
            setActiveChannel(channel); // Set the channel to the state.
        }

        // Bind an event listener to the channel for successful subscription.
        channel.bind("pusher:subscription_succeeded", (members: Members) => {
            const initialMembers: string[] = []; // Array to store the initial members' IDs.

            // Using `.each()` because `Members` is a Pusher class, not a normal array.
            members.each((member: Record<string, any>) => initialMembers.push(member.id));
            
            set(initialMembers); // Update the active list with the initial members.
        });

        // Bind an event listener for when a new member is added to the channel.
        channel.bind("pusher:member_added", (member: Record<string, any>) => {
            add(member.id); // Add the new member to the active list.
        });

        // Bind an event listener for when a member is removed from the channel.
        channel.bind("pusher:member_removed", (member: Record<string, any>) => {
            remove(member.id); // Remove the member from the active list.
        });

        // Cleanup function to unsubscribe from the Pusher channel when the component unmounts.
        return () => {
            if (activeChannel) {
                pusherClient.unsubscribe("presence-messenger"); // Unsubscribe from the "presence-messenger" channel.
                setActiveChannel(null); // Reset the active channel state.
            }
        };

    }, [activeChannel, set, add, remove]); // Re-run the effect if `activeChannel`, `set`, `add`, or `remove` changes.

};

export default useActiveChannel;
