var socket = io.connect('http://localhost:3000');

//prompt warn accept
socket.on('uiEvent', function(ev) {
    if (typeof ev.resEvent !== 'undefined') {
        var res = ui[ev.event](ev.data);
        console.log('sending response:' + ev.resEvent + 'res: ' + res);
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
