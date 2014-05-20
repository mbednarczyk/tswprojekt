var socketio = require('socket.io');
exports.socketServer = function(app, server) {
    var io = socketio.listen(server);

    var Rooms = [],
        Users = [];

    var User = function(name, socket) {
        this.name = name;
        this.socket = socket;
    };

    var Room = function(name){
        this.name = name;
    };

    var addUser = function(name, socket) {
        if (typeof Users[name] === 'undefined') {
            Users[name] = (new User(name, socket));
            socket.set('nickname', name);
            console.log('nowy user: ' + name);
            joinRoom('lobby', socket);
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
        if (typeof Rooms[data] === 'undefined') {
            joinRoom(data,socket);
            io.sockets.in('lobby').emit('uiEvent', {
                event: 'updateRooms',
                data: (io.sockets.manager.rooms)
            });
            Rooms[data] = (new Room(data));
            console.log('creating room ' + data);
            console.log(Rooms);
        } else {
            joinRoom(data,socket);
        }
    };

    var joinRoom = function(data, socket) {
        console.log('user joined ' + data + ' :' + socket );
        socket.join(data);
        io.sockets.in(data).emit('uiEvent',{
            event: 'alert',
            data: 'new user'
        });
    };

    var updateRooms = function(data, socket) {
        io.sockets.in(data).emit('uiEvent', {
            event: 'updateRooms',
            data: (io.sockets.manager.rooms)
        });
    };


    io.sockets.on('connection', function(socket) {

        setLogin(socket);
        updateRooms('lobby', socket);
        socket.on('setLogin', function(data) {
            addUser(data, socket);
        });
        socket.on('newRoom', function(data) {
            addRoom(data, socket);
        });
        socket.on('addRoom', function(data) {
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
