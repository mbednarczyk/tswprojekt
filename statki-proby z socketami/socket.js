var socketio = require('socket.io');
exports.socketServer = function(app, server) {
    var io = socketio.listen(server);
    var Rooms = [],
    Users = [];

    var Player = function(name, id) {
        this.id = id;
        this.name = name;
    };

    //tworzenie mapy - tablica, a pozniej tablica tablic (tablica 2wymiarowa :))
    var generateMap = function(size) {
        var obj = new Array();
        for (var i = 0; i < size; i++) {
            obj[i] = new Array();
            for (var j = 0; j < size; j++) {
                obj[i][j] = 0;
            }
        }
        return obj;
    };

    var Room = function(name) {
        var self = this;
        this.name = name;
        this.users = {};
        this.addUser = function() {};
        this.delUser = function(name) {
            this.users[name] = undefined;
            this.game.leave(name);
        };
        var playerCount = 0;
        var idNum = 0;
        this.emit = function(event,data){
                io.sockets.in(self.name).emit( event, data );
                };
        this.game = {
            status: 'not started',
            mapSize: 10,
            players: {},
            queue: [],
            teams: [
                [],
                []
            ],
            teamEmit : function(user, event, data){
                var temp = this.teams[user.team];
                for (var i=0; i<temp.length; i++){
                    Users[temp[i]].emit(event, data);
                }
            },
            setReady: function(name, val) {
                var state = (val === true) ? 'ready' : undefined;
                this.players[name].state = state;
                var readyCount = 0;
                for (var player in this.players) {
                    if (this.players[player].state === 'ready') {
                        readyCount += 1;
                    }
                }
                if (readyCount === playerCount) {
                    this.init();
                }
            },
            readyCheck: function() {
                for (var player in this.players) {
                    Users[this.players[player].name].emit('readyCheck', {
                        room: self.name
                    });
                }
            },
            init: function() {
                this.status = 'initialized';
                console.log('initializing the game')
                for (var player in this.players) {
                    this.queue.push(player);
                    this.players[player].map = generateMap(this.mapSize);
                    //ilosc statków
                    this.players[player].moves = 4;
                }
                self.emit('gameStarted', {
                    players: this.players,
                    teams: this.teams
                });
            },
            leave: function(name) {
                if (this.players[name] !== undefined) {
                    this.players[name] = undefined;
                    var teams = self.game.teams;
                    teams[0].splice(teams[0].indexOf(name), 1);
                    teams[1].splice(teams[1].indexOf(name), 1);
                    playerCount -= 1;
                    this.status = 'not started';
                    toggleJoin(self.name, 1);
                }
            },
            join: function(name) {
                if ((this.status === 'not started') && playerCount < 4) {
                    idNum += 1;
                    this.players[name] = new Player(name, idNum);
                    if (this.teams[0].length > this.teams[1].length) {
                        this.players[name].team = 1;
                        this.teams[1].push(name);
                    } else {
                        this.players[name].team = 0;
                        this.teams[0].push(name);
                    }
                    playerCount += 1;
                    if (playerCount === 4) {
                        this.status = 'full';
                        toggleJoin(self.name, 0);
                    }
                } else {
                    Users[name].emit('uiEvent', {
                        event: 'warn',
                        data: 'cannot join'
                    });
                }
            },
            placeShips: function() {
                this.status = 'shipPlacement';
            },
            startGame: function(name) {
                this.players[name].state = 'shipsPlaced';
                this.players[name].moves = 0;
                var readyCount = 0;
                for (var player in this.players) {
                    if (this.players[player].state === 'shipsPlaced') {
                        readyCount += 1;
                    }
                }
                if (readyCount === playerCount) {
                    console.log('ships placed, game starting !')
                    this.status = 'started';
                    self.emit('uiEvent', {
                        event: 'warn',
                        data: 'game started'
                    });
                    this.nextTurn();
                }
            },
            nextTurn: function() {
                this.players[this.queue[0]].moves += 2;
                Users[this.queue[0]].emit('uiEvent', {
                    event: 'warn',
                    data: 'your Move !'
                });
                Users[this.queue[0]].broadcast.to(self.name).emit('uiEvent', {
                    event: 'warn',
                    data: 'turn: ' + this.queue[0] 
                });
                var a = this.queue.shift();
                this.queue.push(a);
            },
            shoot: function(name, data) {
                if (this.status === 'started') {
                    if (this.players[name].moves > 0) {
                        this.players[name].moves -= 1;
                        if(this.players[data.target].map[data.x][data.y] !== 0){
                            self.emit('uiEvent', {
                                event: 'warn',
                                data: 'TRAFIONY ' + data.target + '['+ data.x + ', ' + data.y +  ']'
                            });
                            self.emit('gameEvent', {
                                event: 'markShoot',
                                data: data
                            });
                            this.players[data.target].map[data.x][data.y] = 0; 
                            this.players[name].moves += 1;
                        }else{
                            self.emit('uiEvent', {
                                event: 'warn',
                                data: 'PUDŁO ' + data.target + '['+ data.x + ', ' + data.y +  ']'
                            });
                        }
                        if (this.players[name].moves === 0) {
                            this.nextTurn();
                        }
                    }
                }
            },
            //ustawianie statków
            focus: function(name, data) {
                if (this.players[name].moves > 0) {
                    this.players[name].moves -= 1;
                    console.log('focusing :' + JSON.stringify(data));
                    if(this.players[name].map[data.x][data.y] === 0){
                        console.log('empty') 
                        this.players[name].map[data.x][data.y] = 1; 
                    }
                    if (this.status === 'started') {
                        if (this.players[name].moves === 0) {
                            this.nextTurn();
                        }
                    }
                    this.teamEmit(this.players[name], 'gameEvent', {
                        event: 'show',
                        data: this.players[name] 
                    })

                }
            }
        };
    };

    //dodawanie usera wraz z walidacja(czy juz jest user o takiej nazwie)
    var addUser = function(name, socket) {
        if (typeof Users[name] === 'undefined') {
            Users[name] = socket;
            socket.set('nickname', name);
            console.log('nowy user: ' + name);
            joinRoom('lobby', socket);
            socket.emit('uiEvent', {
                event: 'setName',
                data: name
            });
        } else {
            setLogin(socket);
            console.log('user istnieje: ' + name);
        }
    };

    //nadawanie loginu userowi przez prompt
    var setLogin = function(socket) {
        socket.emit('uiEvent', {
            event: 'prompt',
            resEvent: 'setLogin',
            data: 'set ur login'
        });
    };

    //dodawanie pokoju z walidacja(czy pokoj o tej nazwie istnieje)
    var addRoom = function(name, socket) {
        if (typeof Rooms[name] === 'undefined') {
            Rooms[name] = (new Room(name));
            joinRoom(name, socket);
            updateRooms('', socket);
            console.log('created room ' + name);
        } else {
            joinRoom(name, socket);
        }
    };

    
    var joinRoom = function(data, socket) {
        var name = getNick(socket);
        console.log('user joined ' + data + ' :' + name);
        var myRooms = io.sockets.manager.roomClients[socket.id];
        for (var room in myRooms) {
            room = room.substring(1);
            if (typeof Rooms[room] !== "undefined") {
                Rooms[room].delUser(name);
            }
            socket.leave(room);
        }
        socket.join(data);
        Rooms[data].users[name] = name;
        updateUsers(data);
        socket.emit('uiEvent', {
            event: 'warn',
            data: 'joining room: ' + data
        });
        socket.emit('uiEvent', {
            event: 'setRoom',
            data: data
        });
        socket.broadcast.to(data).emit('uiEvent', {
            event: 'warn',
            data: 'user joined ' + name
        });
    };

    var updateUsers = function(room) {
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

    var getNick = function(socket) {
        var name = '';
        socket.get('nickname', function(err, nickname) {
            name = nickname;
        });
        return name;
    };

    var toggleJoin = function(room, val) {
        io.sockets.in(room).emit('uiEvent', {
            event: 'toggleJoin',
            data: val
        });
    };

    Rooms['lobby'] = (new Room('lobby'));
    io.sockets.on('connection', function(socket) {
        //toggleJoin('lobby', 0);
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
        socket.on('setReady', function(data) {
            Rooms[data.room].game.setReady(getNick(socket), data.val);
        });
        socket.on('initGame', function(data) {
            Rooms[data].game.readyCheck();
        });
        socket.on('initDone', function(data) {
            Rooms[data].game.placeShips();
        });
        socket.on('shipsPlaced', function(data) {
            Rooms[data].game.startGame(getNick(socket));
        });
        socket.on('gameEvent', function(data) {
            Rooms[data.room].game[data.event](getNick(socket), data.data);
        });
        //        console.log(io.sockets.manager.roomClients[socket.id]);
    });
};
