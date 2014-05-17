var socketio = require('socket.io');
exports.socketServer = function(app, server) {
    var io = socketio.listen(server);

    var Rooms = [],
        Users = [];

    var User = function(name, socket) {
        this.name = name;
        this.socket = socket;
    };

    var addUser = function(name, socket) {
        if (typeof Users[name] === 'undefined') {
            Users[name] = (new User(name, socket));
            console.log('nowy user: ' + name);
            console.log(Users);
        } else {
            setLogin(socket);
            console.log('user istnieje: ' + name);
        }
    };

    var setLogin = function(socket) {
        socket.emit('uiEvent', {
            event: 'prompt',
            resEvent: 'setLogin',
            data: 'set ur login'
        });
    };

    var addRoom = function(data, socket) {
        socket.leave('lobby');
        socket.join(data);
    };

    var joinRoom = function(data, socket) {
        socket.leave('lobby');
        socket.join(data);
    };

    var updateRooms = function(socket) {
        socket.emit('uiEvent', {
            event: 'updateRooms',
            data: (io.sockets.manager.rooms)
        });
    };


    io.sockets.on('connection', function(socket) {

        socket.join('lobby');
        setLogin(socket);
        updateRooms(socket);
        socket.on('setLogin', function(data) {
            addUser(data, socket);
        });
        socket.on('newRoom', function(data) {
            addRoom(data, socket);
        });
        socket.on('joinRoom', function(data) {
            joinRoom(data, socket);
        });
        console.log('rooms: ');
        console.log(io.sockets.manager.rooms);
        //        console.log(io.sockets.manager.roomClients[socket.id]);
    });
};
