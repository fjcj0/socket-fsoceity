export async function send_contact_message(socket, io) {
    socket.on('on-send-contact-message', async () => {
        try {

        } catch (error) {
            console.log(error);
        }
    });
}
export async function contact_messages() {
    socket.on('on-get-contact-messages', async () => {
        try {

        } catch (error) {
            console.log(error);
        }
    });
}