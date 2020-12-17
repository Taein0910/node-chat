var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = http.createServer(app);
var http = require('http').Server(app);
var io = require('socket.io')(server);
var mongoose = require('mongoose');
var roomName;

const MongoClient = require('mongodb').MongoClient;

app.use(express.static('views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 화면 engine을 ejs로 설정
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res) {
    res.render('index.html')
});


var count = 0;
var rooms = [];
var Message;
var VideoList;

app.get('/room', function(req, res) {
    roomName = req.query.roomname;
    console.log('room name is :' + roomName);
    mongoose.models = {};
    Message = mongoose.model(roomName + '/messages', {
        name: String,
        message: String
    });
    VideoList = mongoose.model(roomName + '/videolist', {
        id: String
    });
    res.render('room.html', { room: roomName });
});

const uri = 'mongodb+srv://dbuser:yti050910@cluster0.u2uiy.mongodb.net/ChatBotdb?retryWrites=true&w=majority';

app.get('/messages', (req, res) => {
    try {
        Message.find({}, (err, messages) => {
            if (err) {
                console.log('error', err);
            }
            console.log('getting All message....', messages);
            res.send(messages);
        })
    } catch (error) {
        res.sendStatus(500);
        return console.log('error', error);
    }
})


app.get('/messages/:user', (req, res) => {
    var user = req.params.user
    Message.find({ name: user }, (err, messages) => {
        res.send(messages);
    })
})


app.post('/messages', async(req, res) => {
    try {
        var message = new Message(req.body);
        console.log('Sending Message....', message);

        var savedMessage = await message.save()
        console.log('saved');

        var censored = await Message.findOne({ message: 'badword' });
        if (censored)
            await Message.remove({ _id: censored.id })
        else
            io.to(roomName).emit('message', req.body);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
        return console.log('error', error);
    } finally {
        console.log('Message Posted')
    }

})


app.get('/videolists', (req, res) => {
    try {
        VideoList.find({}, (err, ids) => {
            if (err) {
                console.log('error', err);
            }
            console.log('getting All message....', ids);
            res.send(ids);
        })
    } catch (error) {
        res.sendStatus(500);
        return console.log('error', error);
    }
})

app.post('/videolists', async(req, res) => {
    try {
        var id = new VideoList(req.body);
        console.log('adding id on videolist....', id);

        var savedMessage = await id.save()

        var censored = await VideoList.findOne({ id: 'badword' });
        if (censored)
            await VideoList.remove({ _id: censored.id })
        else
            io.to(roomName).emit('id', req.body);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
        return console.log('error', error);
    } finally {
        console.log('videoList Posted')
    }

})

io.on('connection', function(socket) {
    console.log('socket.io connected');

    socket.on('joinroom', function(data) {
        socket.join(data.room);
        roomName = data.room;
        console.log('join room :' + roomName);

        io.set('room', data.room, function() {
            var room = data.room;
            var nickname = '손님-' + count;
            socket.set('nickname', nickname, function() {
                socket.emit('changename', { nickname: nickname });

                // Create Room
                if (rooms[room] == undefined) {
                    console.log('room create :' + room);
                    rooms[room] = new Object();
                    rooms[room].socket_ids = new Object();

                }
                // Store current user's nickname and socket.id to MAP
                rooms[room].socket_ids[nickname] = socket.id

                // broad cast join message
                data = { msg: nickname + ' 님이 입장하셨습니다.' };
                io.sockets.in(room).emit('broadcast_msg', data);

                // broadcast changed user list in the room
                io.sockets.in(room).emit('userlist', { users: Object.keys(rooms[room].socket_ids) });
                count++;
            });
        });
    });

});


mongoose.connect(uri, { useNewUrlParser: true }, (err) => {
        if (err) { console.log('Error while connecting', err) }
        console.log('mongodb connected ');
    })
    // client.connect(err => {
    //     //const collection = client.db("ChatBotdb").collection("Message");

//     console.log('mongodb connected', err);
// })
// client.connect(err => {
//     const collection = client.db("ChatBotdb").collection("Message");
//     // perform actions on the collection object
//     console.log('mongodb connected', err);
//     //client.close();
// });

var server = http.listen(8080, () => {
    console.log('server is running on port', server.address().port);
});