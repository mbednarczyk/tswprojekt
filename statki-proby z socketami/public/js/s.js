var game = function(){
    var self = this;
    this.init = function(players){
        for(var player in players){
            console.log(this);
            console.log(self);
        }
    };
};
var room='';
var nick='';
var ui = {
    setRoom: function(a) {
        document.title=a+'(room)';
        room = a;
        $('#roomName').html(a);
    },
    warn: function(a) {
        return  $('#warn').html(a);
    },
    alert: function(a) {
        return (window.alert(a));
    },
    confirm: function(a) {
        return (window.confirm(a));
    },
    prompt: function(a) {
        return (window.prompt(a));
    },
    updateRooms: function(data) {
        var rooms = '';
        for (var a in data) {
            rooms += '<li>' + a.substring(1) + '</li>';
        }
        $('#rooms').html(rooms);
    },
    updateUsers: function(data) {
        console.log(data);
        var rooms = '';
        for (var a in data) {
            rooms += '<li>' + data[a] + '</li>';
        }
        $('#users').html(rooms);
    }
};


$(function() {
    $("#joinGame").on('click', function(e) {
        joinGame(room);
    });
    $("#newRoom").on('click', function(e) {
        var name = ui.prompt('set new room name');
        addRoom(name);
    });
    $("#rooms").on('click', 'li', function(e) {
        joinRoom($(this).html());
    });
});
