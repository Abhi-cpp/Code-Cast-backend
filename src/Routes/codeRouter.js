module.exports = (io, socket, connection) => {
    const fun = (code) => {
        console.log(code, "total connections", connection)
        socket.broadcast.emit('code-update', code)
    }
    socket.on('code-update', fun);

}