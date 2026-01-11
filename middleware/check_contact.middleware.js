export async function checkContact(socket, receiverId) {
    const isContact = await prisma.contact.findFirst({
        where: {
            OR: [
                { userId: socket?.user?.id, friendId: receiverId },
                { userId: receiverId, friendId: socket?.user?.id }
            ]
        }
    });
    if (!isContact) {
        throw new Error("You can't send messages to users who are not in your contacts");
    }
}