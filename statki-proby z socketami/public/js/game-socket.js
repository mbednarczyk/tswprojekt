var socket = io.connect('http://' + location.host);

//prompt warn accept
socket.on('uiEvent', function(ev) {
    if (typeof ev.resEvent !== 'undefined') {
        var res = ui[ev.event](ev.data);
        socket.emit(ev.resEvent, res);
    } else {
        ui[ev.event](ev.data);
    }
});

//place ships, update map, 
socket.on('gameEvent', function(ev) {
    var res = game[ev.event](ev.data);
    socket.emit(ev.event, res);
});

socket.on('readyCheck', function(data) {
    var res = {};
    res.val = ui.confirm('ready to start?');
    res.room = data.room;
    socket.emit('setReady', res);
});

socket.on('gameStarted', function(data) {
    game = new Game(data);
    game.init();
});

var joinRoom = function(name) {
    console.log('joining room: ' + name);
    socket.emit('joinRoom', name);
};

var addRoom = function(name) {
    console.log('joining room: ' + name);
    socket.emit('addRoom', name);
};

var joinGame = function(name) {
    socket.emit('joinGame', name);
};

var initGame = function(name) {
    socket.emit('initGame', name);
};

var initDone = function(name) {
    socket.emit('initDone', name);
};

var shipsPlaced = function(name) {
    socket.emit('shipsPlaced', name);
};

var gameEvent = function(room, event, data) {
    socket.emit('gameEvent', {
        room: room,
        event: event,
        data: data
    });
};
