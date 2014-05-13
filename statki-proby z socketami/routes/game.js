var express = require('express');
var router = express.Router();
var socketio = require('socket.io');

router.get('/', function(req, res) {
    res.render('game-room', { title: 'Game Room' });
});



router.listen = function(server){
    var io = socketio.listen(server);
    io.sockets.on('connection', function (socket) {
        socket.emit('news', { hello: 'world' });
        socket.on('my other event', function (data) {
            console.log(data);
        });
    })
}
module.exports = router;
