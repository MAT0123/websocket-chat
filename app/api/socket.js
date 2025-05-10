// import { Server } from 'socket.io'

// const SocketHandler = (req, res) => {
//   if (res.socket.server.io) {
//     console.log('Socket is already running')
//   } else {
//     console.log('Socket is initializing')
//     const io = new Server(res.socket.server)
//     res.socket.server.io = io

//     io.on('connection', socket => {
//       console.log('Client connected:', socket.id)
      
//       socket.on('message', (data) => {
//         // Broadcast message to all connected clients
//         io.emit('message', {
//           id: Date.now(),
//           user: socket.id,
//           text: data.text,
//           timestamp: new Date().toISOString()
//         })
//       })

//       socket.on('disconnect', () => {
//         console.log('Client disconnected:', socket.id)
//       })
//     })
//   }
//   res.end()
// }

// export default SocketHandler