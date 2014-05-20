var ui = {
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
        console.log('rooms: ');
        var rooms = '';
        for (var a in data) {
            rooms += '<li>' + a.substring(1) + '</li>';
        }
        $('#rooms').html(rooms);
        console.log(rooms);
        console.log(data);
    },
};

$(function() {
    $("#newRoom").on('click', function(e) {
        var name = ui.prompt('set new room name');
        addRoom(name);
    });
    $("#rooms").on('click', 'li', function(e) {
        joinRoom($(this).html());
    });
});
