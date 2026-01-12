import { prisma } from "../lib/prisma.js";
import { checkContact } from "../middleware/check_contact.middleware.js";
export async function send_contact_message(socket, io) {
    socket.on('on-send-contact-message', async (data) => {
        try {
            const senderId = socket.user.id;
            const { receiverId, content, image, voice } = data;

            const isContact = await prisma.contact.findFirst({
                where: {
                    OR: [
                        { userId: senderId, friendId: receiverId },
                        { userId: receiverId, friendId: senderId }
                    ]
                }
            });
            if (!isContact) return;

            const message = await prisma.contactMessage.create({
                data: {
                    senderId,
                    receiverId,
                    content,
                    image,
                    voice
                },
                include: {
                    sender: { select: { id: true, name: true, profilePicture: true } },
                    receiver: { select: { id: true, name: true, profilePicture: true } }
                }
            });

            io.to(senderId).emit("receive-message", message);
            io.to(receiverId).emit("receive-message", message);
        } catch (error) {
            console.log(error);
        }
    });
}