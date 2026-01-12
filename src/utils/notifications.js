import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export async function sendNotification(recipientId, type, message, teamId = null) {
    if (!recipientId) return;

    try {
        await addDoc(collection(db, "notifications"), {
            recipientId,
            type,
            message,
            teamId,
            read: false,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}
