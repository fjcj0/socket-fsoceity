import { updateReceiverRequests, updateUserRequests } from "../handler/user-contact.handler.js";
import { prisma } from "../lib/prisma.js";
export async function send_request(socket) {
    socket.on('send-request', async (receiverId) => {
        if (!socket.user?.id) return;
        try {
            await prisma.friendRequest.create({
                data: { senderId: socket.user.id, receiverId }
            });
            socket.to(receiverId).emit('notification', {
                action: 'A friend request was sent',
                by: socket.user.name,
                image: socket.user.profilePicture
            });
            await updateReceiverRequests(socket.to(receiverId), receiverId);
            await updateUserRequests(socket, socket.user.id);
        } catch (error) {
            console.log(error);
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
            await updateReceiverRequests(socket.to(receiverId), receiverId);
            await updateUserRequests(socket, socket.user.id);
        } catch (error) {
            console.log(error);
        }
    });
}
export async function acceptRequest(socket) {
    socket.on('accept-request', async (senderId) => {
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
            await updateReceiverRequests(socket, socket.user.id);
            await updateUserRequests(socket, socket.user.id);
        } catch (error) {
            console.log(error);
        }
    });
}
export async function rejectRequest(socket) {
    socket.on('reject-request', async (senderId) => {
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
            await updateReceiverRequests(socket, socket.user.id);
            await updateUserRequests(socket, socket.user.id);
        } catch (error) {
            console.log(error);
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
            await updateReceiverRequests(socket.to(friendId), friendId);
            await updateUserRequests(socket, socket.user.id);
        } catch (error) {
            console.log(error);
        }
    });
}