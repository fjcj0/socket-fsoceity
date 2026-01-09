import { prisma } from "../lib/prisma.js";
async function updateUserRequests(socket, userId) {
    const userPendings = await prisma.friendRequest.findMany({
        where: { senderId: userId, status: 'PENDING' },
        select: {
            receiver: { select: { id: true, name: true, profilePicture: true, createdAt: true } }
        }
    });
    socket.emit('user_pending', userPendings);
    const userAccepted = await prisma.friendRequest.findMany({
        where: { senderId: userId, status: 'ACCEPTED' },
        select: {
            receiver: { select: { id: true, name: true, profilePicture: true, createdAt: true } }
        }
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
            id: {
                not: userId,
                notIn: [
                    ...contacts.map(c => c.friendId),
                    ...sentRequests.map(r => r.receiverId)
                ]
            }
        },
        select: { id: true, name: true, profilePicture: true, createdAt: true }
    });
    socket.emit('user_not_sent', usersNotSent);
}
export async function send_request(socket) {
    socket.on('send-request', async (receiverId) => {
        if (!socket.user?.id) return;
        try {
            const request = await prisma.friendRequest.create({
                data: { senderId: socket.user.id, receiverId }
            });
            const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
            socket.to(receiverId).emit('notification', {
                action: 'A friend request was sent',
                by: socket.user.name,
                image: socket.user.profilePicture
            });
            const recives = await prisma.friendRequest.findMany({
                where: { receiverId, status: 'PENDING' },
                select: {
                    senderId: true,
                    sender: { select: { id: true, name: true, profilePicture: true, createdAt: true } }
                }
            });
            socket.to(receiverId).emit('recives', recives);
            await updateUserRequests(socket, socket.user.id);
        } catch (error) {
            console.error(error);
        }
    });
}
export async function cancel_sent_request(socket) {
    socket.on('cancel-sent-request', async (receiverId) => {
        if (!socket.user?.id) return;
        try {
            const request = await prisma.friendRequest.findFirst({
                where: { senderId: socket.user.id, receiverId }
            });
            if (!request) return;
            await prisma.friendRequest.delete({ where: { id: request.id } });
            socket.to(receiverId).emit('notification', {
                action: 'A friend request was cancelled',
                by: socket.user.name,
                image: socket.user.profilePicture
            });
            const recives = await prisma.friendRequest.findMany({
                where: { receiverId, status: 'PENDING' },
                select: {
                    senderId: true,
                    sender: { select: { id: true, name: true, profilePicture: true, createdAt: true } }
                }
            });
            socket.to(receiverId).emit('recives', recives);
            await updateUserRequests(socket, socket.user.id);
        } catch (error) {
            console.error(error);
        }
    });
}
export async function accept_recive(socket) {
    socket.on('accept-recive', async (senderId) => {
        if (!socket.user?.id) return;
        try {
            await prisma.friendRequest.update({
                where: { senderId_receiverId: { senderId, receiverId: socket.user.id } },
                data: { status: 'ACCEPTED' }
            });
            await prisma.contact.createMany({
                data: [
                    { userId: socket.user.id, friendId: senderId },
                    { userId: senderId, friendId: socket.user.id }
                ],
                skipDuplicates: true
            });
            socket.to(senderId).emit('notification', {
                action: 'Your friend request was accepted',
                by: socket.user.name,
                image: socket.user.profilePicture
            });
            await updateUserRequests(socket, socket.user.id);
        } catch (error) {
            console.error(error);
        }
    });
}
export async function cancel_recive(socket) {
    socket.on('cancel-recive', async (senderId) => {
        if (!socket.user?.id) return;
        try {
            const request = await prisma.friendRequest.findFirst({
                where: { senderId, receiverId: socket.user.id }
            });
            if (!request) return;
            await prisma.friendRequest.delete({ where: { id: request.id } });
            socket.to(senderId).emit('notification', {
                action: 'Your friend request was rejected',
                by: socket.user.name,
                image: socket.user.profilePicture
            });
            await updateUserRequests(socket, socket.user.id);
        } catch (error) {
            console.error(error);
        }
    });
}
export async function remove_contact(socket) {
    socket.on('remove-contact', async (friendId) => {
        if (!socket.user?.id) return;
        try {
            await prisma.contact.deleteMany({
                where: {
                    OR: [
                        { userId: socket.user.id, friendId },
                        { userId: friendId, friendId: socket.user.id }
                    ]
                }
            });
            socket.to(friendId).emit('notification', {
                action: 'You were removed from contacts',
                by: socket.user.name,
                image: socket.user.profilePicture
            });
            await updateUserRequests(socket, socket.user.id);
        } catch (error) {
            console.error(error);
        }
    });
}