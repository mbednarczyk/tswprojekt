var socketio = require('socket.io');
exports.socketServer = function(app, server) {
    var io = socketio.listen(server);

    var Rooms = [],
    Users = [];


    var Room = function(name){
        var self = this;
        this.name = name;
        this.users={};
        this.addUser = function(){};
        this.delUser = function(name){
            this.users[name]=undefined;
            this.game.leave(name);
        };
        var playerCount = 0;
        this.game={
            status:'not started',
            players:{},
            teams:[ [], [] ],
            leave: function(name){
                if(this.players[name]!== undefined){
                    this.players[name]=undefined;
                    var teams = self.game.teams;
                    teams[0].splice(teams[0].indexOf(name), 1);
                    teams[1].splice(teams[1].indexOf(name), 1);
                    playerCount-=1;
                    this.status = 'not started';
                    toggleJoin(self.name,1);
                } 
            },
            join: function(name){
                if((this.status === 'not started') && playerCount<4){
                    this.players[name]= name;
                    if(this.teams[0].length>this.teams[1].length){
                        this.teams[1].push(name);
                    }
                    else{
                        this.teams[0].push(name);
                    }
                    playerCount+=1;
                    if(playerCount===4){
                        this.status = 'full';
                        toggleJoin(self.name,0);
                    }
                    console.log(this);
                }
                else{
                    Users[name].emit('uiEvent', {
                        event: 'warn',
                        data: 'cannot join'
                    });
                }
            }
        };
    };

    var addUser = function(name, socket) {
        if (typeof Users[name] === 'undefined') {
            Users[name] = socket;
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

    var addRoom = function(name, socket) {
        if (typeof Rooms[name] === 'undefined') {
            Rooms[name] = (new Room(name));
            joinRoom(name,socket);
            updateRooms('', socket);
            console.log('created room ' + name);
        } else {
            joinRoom(name,socket);
        }
    };

    var joinRoom = function(data, socket) {
        var name = getNick(socket);
        console.log('user joined ' + data + ' :' + name );
        var myRooms = io.sockets.manager.roomClients[socket.id];
        for(var room in myRooms){
            room = room.substring(1);
            if(typeof Rooms[room]!== "undefined"){
                Rooms[room].delUser(name);
            }
            socket.leave(room);
        }
        socket.join(data);
        Rooms[data].users[name]=name;
        updateUsers(data);
        socket.emit('uiEvent',{
            event: 'warn',
            data: 'joining room: ' + data
        });
        socket.emit('uiEvent',{
            event: 'setRoom',
            data: data
        });
        socket.broadcast.to(data).emit('uiEvent',{
            event: 'warn',
            data: 'user joined ' + name
        });
    };

    var updateUsers= function(room) {
        io.sockets.in(room).emit('uiEvent', {
            event: 'updateUsers',
            data: Rooms[room].users
        });
    };


    var updateRooms = function(data, socket) {
        io.sockets.in(data).emit('uiEvent', {
            event: 'updateRooms',
            data: (io.sockets.manager.rooms)
        });
    };

    var getNick = function(socket){
        var name = '';
        socket.get('nickname', function (err, nickname) {
            name = nickname;
        });
        return name;
    };

    var toggleJoin = function(room, val){
        io.sockets.in(room).emit('uiEvent', {
            event: 'toggleJoin',
            data: val
        });
    };

    Rooms['lobby'] = (new Room('lobby'));
    io.sockets.on('connection', function(socket) {
        toggleJoin('lobby',0);
        setLogin(socket);
        updateRooms('', socket);
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
        socket.on('joinGame', function(data) {
            Rooms[data].game.join(getNick(socket));
        });
        socket.on('gameEvent', function(data) {
            Rooms[data.room].game[data.event](getNick(socket), data.data);
        });
        //        console.log(io.sockets.manager.roomClients[socket.id]);
    });
};
