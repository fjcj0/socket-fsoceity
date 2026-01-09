import { prisma } from "../lib/prisma.js";
export function save_post(socket, io) {
    socket.on("save", async (postId) => {
        try {
            const userId = socket.user.id;
            const isFound = await prisma.bookmark.findUnique({
                where: {
                    userId_postId: { userId, postId },
                },
            });
            if (isFound) {
                const deleted = await prisma.bookmark.delete({
                    where: {
                        userId_postId: { userId, postId },
                    },
                    select: {
                        post: {
                            select: {
                                authorId: true,
                                image: true,
                            },
                        },
                    },
                });
                const bookmarks = await prisma.bookmark.findMany({
                    where: { userId },
                    select: {
                        postId: true,
                        post: true,
                    },
                });
                socket.emit("bookmarks", bookmarks);
                io.to(deleted.post.authorId).emit("notification", {
                    action: "Your post was unsaved",
                    by: socket.user.name,
                    image: deleted.post.image,
                });
                return;
            }
            const created = await prisma.bookmark.create({
                data: { userId, postId },
                select: {
                    post: {
                        select: {
                            authorId: true,
                            image: true,
                        },
                    },
                },
            });
            const bookmarks = await prisma.bookmark.findMany({
                where: { userId },
                select: {
                    postId: true,
                    post: true,
                },
            });
            socket.emit("bookmarks", bookmarks);
            io.to(created.post.authorId).emit("notification", {
                action: "Your post was saved",
                by: socket.user.name,
                image: created.post.image,
            });
        } catch (error) {
            console.log(error);
        }
    });
}
export function create_like(socket, io) {
    socket.on("like", async (postId) => {
        try {
            const userId = socket.user.id;
            const isFound = await prisma.like.findUnique({
                where: {
                    userId_postId: { userId, postId },
                },
            });
            if (isFound) {
                const deleted = await prisma.like.delete({
                    where: {
                        userId_postId: { userId, postId },
                    },
                    select: {
                        post: {
                            select: {
                                authorId: true,
                                image: true,
                            },
                        },
                    },
                });
                const likes = await prisma.like.findMany({
                    where: { userId },
                    select: {
                        postId: true,
                        post: true,
                    },
                });
                socket.emit("likes", likes);
                io.to(deleted.post.authorId).emit("notification", {
                    action: "Your post was unliked",
                    by: socket.user.name,
                    image: deleted.post.image,
                });
                return;
            }
            const created = await prisma.like.create({
                data: {
                    userId, postId
                },
                select: {
                    post: {
                        select: {
                            authorId: true,
                            image: true,
                        },
                    },
                },
            });
            const likes = await prisma.like.findMany({
                where: { userId },
                select: {
                    postId: true,
                    post: true,
                },
            });
            socket.emit("likes", likes);
            io.to(created.post.authorId).emit("notification", {
                action: "Your post was liked",
                by: socket.user.name,
                image: created.post.image,
            });
        } catch (error) {
            console.log(error);
        }
    });
}