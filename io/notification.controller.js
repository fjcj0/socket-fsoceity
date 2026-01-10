export async function SendNotification(socket, io) {
    socket.on('on-send-request', async (reciverId) => {
        socket.to(reciverId).emit('notification', {
            action: 'A request has been sent',
            by: socket?.user?.name,
            image: socket?.user?.profilePicture
        });
    });
    socket.on('on-accept-request', async (reciverId) => {
        socket.to(reciverId).emit('notification', {
            action: 'Your request has been accepted',
            by: socket?.user?.name,
            image: socket?.user?.profilePicture
        });
    });
}