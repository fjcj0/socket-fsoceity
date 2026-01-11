import { prisma } from "../lib/prisma.js";
import { checkContact } from "../middleware/check_contact.middleware.js";
export async function send_contact_message(socket, io) {
    socket.on('on-send-contact-message', async (data) => {
        try {
            const { receiverId, content, image } = data;
            await checkContact(socket, receiverId);
            const message = await prisma.contactMessage.create({
                data: {
                    senderId: socket?.user?.id,
                    receiverId,
                    content: content || null,
                    image: image || null
                },
                select: {
                    id: true,
                }
            });
            socket.emit([socket?.user?.id, receiverId], message)
        } catch (error) {
            console.error(error.message);
            socket.emit('error', {
                message: error.message
            });
        }
    });
}