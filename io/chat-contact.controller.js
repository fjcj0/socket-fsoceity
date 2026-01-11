import { checkContact } from "../middleware/check_contact.middleware.js";
export async function send_contact_message(socket, io) {
    socket.on('on-send-contact-message', async (data) => {
        try {
            const { receiverId, message, image } = data;
            await checkContact(socket, receiverId);
        } catch (error) {
            console.error(error.message);
            socket.emit('error', {
                message: error.message
            });
        }
    });
}