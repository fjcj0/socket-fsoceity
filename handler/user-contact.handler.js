export async function updateReceiverRequests(socket, receiverId) {
    if (!receiverId) return;
    try {
        const receiverRequests = await prisma.friendRequest.findMany({
            where: { receiverId, status: 'PENDING' },
            select: {
                senderId: true,
                sender: { select: { id: true, name: true, profilePicture: true, createdAt: true } }
            }
        });
        socket.emit('receiver_requests', receiverRequests);
    } catch (error) {
        console.log("Error updating receiver requests:", error);
    }
}
export async function updateUserRequests(socket, userId) {
    if (!userId) return;

    try {
        const userPending = await prisma.friendRequest.findMany({
            where: { senderId: userId, status: 'PENDING' },
            select: { receiver: { select: { id: true, name: true, profilePicture: true, createdAt: true } } }
        });
        socket.emit('user_pending', userPending);
        const userAccepted = await prisma.friendRequest.findMany({
            where: { senderId: userId, status: 'ACCEPTED' },
            select: { receiver: { select: { id: true, name: true, profilePicture: true, createdAt: true } } }
        });
        socket.emit('user_accepted', userAccepted);
        const contacts = await prisma.contact.findMany({
            where: { userId },
            select: { friendId: true }
        });
        const sentRequests = await prisma.friendRequest.findMany({
            where: { senderId: userId },
            select: { receiverId: true }
        });
        const usersNotSent = await prisma.user.findMany({
            where: {
                id: { not: userId, notIn: [...contacts.map(c => c.friendId), ...sentRequests.map(r => r.receiverId)] }
            },
            select: { id: true, name: true, profilePicture: true, createdAt: true }
        });
        socket.emit('user_not_sent', usersNotSent);
    } catch (error) {
        console.log("Error updating user requests:", error);
    }
}