export async function check_contact(socket, next) {
    const isContact = await prisma.contact.findFirst({
        where: {
            OR: [
                { userId: senderId, friendId: receiverId },
                { userId: receiverId, friendId: senderId }
            ]
        }
    })
    if (!isContact) {
        next(new Error("You can't send message to this user it's not from your contact"));
    }
}