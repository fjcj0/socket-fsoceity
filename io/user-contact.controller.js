import { prisma } from "../lib/prisma.js";
export async function send_request(socket, io) {
    socket.on('send-request', async (userId) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            });
            const request = await prisma.friendRequest.create({
                data: {
                    senderId: socket?.user?.id,
                    receiverId: user.id,
                }, select: {
                    receiverId: true,
                    receiver: true,
                }
            });
            socket.to(request.receiverId).emit('notification', {
                action: `A request sent`,
                by: request.receiver.name,
                image: request.receiver.profilePicture
            });
            const recives = await prisma.friendRequest.findMany({
                where: {
                    receiverId: user.id,
                    status: 'PENDING'
                },
                select: {
                    senderId: true,
                    sender: {
                        select: {
                            profilePicture: true,
                            createdAt: true,
                            name: true,
                            id: true
                        }
                    }
                }
            });
            socket.to(request.receiverId).emit('recives', recives);
            const user_pendings = await prisma.friendRequest.findMany({
                where: {
                    senderId: socket?.user?.id,
                    status: 'PENDING'
                },
                select: {
                    receiver: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true,
                            createdAt: true,
                        }
                    }
                }
            });
            socket.to(socket?.user?.id).emit('user_pending', user_pendings);
            const user_accepted = await prisma.friendRequest.findMany({
                where: {
                    senderId: socket?.user?.id,
                    status: 'ACCEPTED'
                },
                select: {
                    receiver: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true,
                            createdAt: true,
                        }
                    }
                }
            });
            socket.to(socket?.user?.id).emit('user_accepted', user_accepted);
            const users_not_sent = await prisma.user.findMany({
                where: {
                    id: {
                        not: socket.user.id,
                        notIn: [
                            ...(await prisma.contact.findMany({
                                where: { userId: socket.user.id },
                                select: { friendId: true }
                            })).map(c => c.friendId),
                            ...(await prisma.friendRequest.findMany({
                                where: { senderId: socket.user.id },
                                select: { receiverId: true }
                            })).map(r => r.receiverId)
                        ]
                    }
                },
                select: {
                    id: true,
                    name: true,
                    profilePicture: true,
                    createdAt: true,
                }
            });
            socket.to(socket.user.id).emit('user_not_sent', users_not_sent);
        } catch (error) {
            console.log(error);
        }
    });
}
export async function cancel_sent_request(socket, io) {
    try {
        socket.on('cancel-request', async (userId) => {
            try {
                const user = await prisma.user.findUnique({
                    where: {
                        id: userId
                    }
                });
                const request = await prisma.friendRequest.create({
                    data: {
                        senderId: socket?.user?.id,
                        receiverId: user.id,
                    }, select: {
                        receiverId: true,
                        receiver: true,
                    }
                });
                socket.to(request.receiverId).emit('notification', {
                    action: `A request sent`,
                    by: request.receiver.name,
                    image: request.receiver.profilePicture
                });
                const recives = await prisma.friendRequest.findMany({
                    where: {
                        receiverId: user.id,
                        status: 'PENDING'
                    },
                    select: {
                        senderId: true,
                        sender: {
                            select: {
                                profilePicture: true,
                                createdAt: true,
                                name: true,
                                id: true
                            }
                        }
                    }
                });
                socket.to(request.receiverId).emit('recives', recives);
                const user_pendings = await prisma.friendRequest.findMany({
                    where: {
                        senderId: socket?.user?.id,
                        status: 'PENDING'
                    },
                    select: {
                        receiver: {
                            select: {
                                id: true,
                                name: true,
                                profilePicture: true,
                                createdAt: true,
                            }
                        }
                    }
                });
                socket.to(socket?.user?.id).emit('user_pending', user_pendings);
                const user_accepted = await prisma.friendRequest.findMany({
                    where: {
                        senderId: socket?.user?.id,
                        status: 'ACCEPTED'
                    },
                    select: {
                        receiver: {
                            select: {
                                id: true,
                                name: true,
                                profilePicture: true,
                                createdAt: true,
                            }
                        }
                    }
                });
                socket.to(socket?.user?.id).emit('user_accepted', user_accepted);
                const users_not_sent = await prisma.user.findMany({
                    where: {
                        id: {
                            not: socket.user.id,
                            notIn: [
                                ...(await prisma.contact.findMany({
                                    where: { userId: socket.user.id },
                                    select: { friendId: true }
                                })).map(c => c.friendId),
                                ...(await prisma.friendRequest.findMany({
                                    where: { senderId: socket.user.id },
                                    select: { receiverId: true }
                                })).map(r => r.receiverId)
                            ]
                        }
                    },
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true,
                        createdAt: true,
                    }
                });
                socket.to(socket.user.id).emit('user_not_sent', users_not_sent);
            } catch (error) {
                console.log(error);
            }
        });
    } catch (error) {
        console.log(error);
    }
}
export async function accept_request(socket, io) {
    try {

    } catch (error) {
        console.log(error);
    }
}
export async function cancel_request(socket, io) {
    try {

    } catch (error) {
        console.log(error);
    }
}
export async function remove_contact(socket, io) {
    try {

    } catch (error) {
        console.log(error);
    }
}