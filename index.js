const cors = require('cors');
const express = require('express')
const app = express();
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server)

app.use(cors());

var mysql = require('mysql2');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database:'chat_task',
});
// const con = mysql.createPool(configuration);
db.connect (err => {
    if(err) throw err;
    console.log("mysql connected");
    
})

app.get('/api/rooms', (req, res) =>{
    db.query('SELECT * FROM rooms',(err, result) => {
        if(err) throw err;
        res.json(result);
    })
})

app.get('api/rooms/:roomId/messages', (req, res) => {
    const {roomId} = req.params;
    db.query('SELECT * FROM messages WHERE id =?', [roomId], (err, result) => {
        if (err) throw err;
        res.json(result)
    })
})

app.use(express.static('public'))
io.on('connection', (socket) => {
    console.log('new user connected');

    socket.on('joinRoom', ({ username, room}) => {
        socket.join(room);

        socket.emit('message', {user: 'admin', message: 'Welcome '+username+' to the '+room+''});

        socket.brodcast.to(room).emit('message', { user: 'admin', message: ''+user+' joined room'});
    })

    socket.io('chatmessage', ({usernmae, room, message}) => {
        db.query('INSERT INTO messages (room_id, user, message) VALUES (?, ?, ?)', [room, usernmae, message], (err) => {4
            if(err) throw err;

            io.to(room).emit('message', {user: usernmae,message});
        });
    });
    
})

try{
    app.listen("2124");
    console.log('Server running on PORT 2124');
    
}catch(err){
    console.log(err);
}

