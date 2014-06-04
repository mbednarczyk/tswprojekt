var Game = function(data){
    var self = this;
    this.myTeam = '';
    this.players = data.players;
    this.teams = data.teams;
    this.init = function(){
        $('#initGame').remove();
        $('#shipsPlaced').remove();
        var obj = $('#gameField');
        obj.html('');
        for(var team in this.teams){
            obj.append('<div id="team' + team + '" class="team"></div>');
            for(var player in this.teams[team]){
                var name = this.teams[team][player];
                $('#team'+team).append('<p>' + name + '</p><table id="' + name + '" class="map"></table>');
                if(name == myName){
                    this.myTeam = team;
                    $('#'+ name).addClass('myMap');
                    $('#'+ name).parent().closest('div').addClass('myTeam');
                }
            }
        }
        this.showAll();
        $('#gameField').on('click', 'td', function(){
            var data = $(this).attr('id').split('_');
            if(data[0] === myName){
                gameEvent( room, 'focus', {
                    target: data[0],
                    x: data[1],
                    y: data[2]
                });
            }else if(game.teams[game.myTeam].indexOf(data[0]) !== -1){

            }else{
                gameEvent( room, 'shoot', {
                    target: data[0],
                    x: data[1],
                    y: data[2]
                });
            }
        });
        $('#gameMenu').append( '<input id="shipsPlaced" type="button" value="ready"/>');
        $("#gameMenu").on('click', '#shipsPlaced', function(e) {
            shipsPlaced(room);
        });
        initDone(room);
    };
    this.showAll = function(){
        for( var player in this.players){
            this.show(this.players[player]);
        }
    };
    this.show = function(player){
        var map = player.map;
        var tab = '<table id="' + player.name + '">';
        for (var i = 0; i < map.length; i++) {
            tab += '<tr>';
            for (var j = 0; j < map.length; j++) {
                if (map[i][j] === 0) {
                    tab += '<td id="' + player.name + '_' + i + '_' + j + '" class="empty"></td>';
                } else if (map[i][j] === 1) {
                    tab += '<td id="' + player.name + '_' +  i + '_' + j + '" class="statek"></td>';
                } else {
                    tab += '<td id="' + player.name + '_' + i + '_' + j + '" > </td>';
                }
            }
            tab += '</tr>';
        }
        $('#' + player.name).html(tab);
    };
    this.markShoot = function(data){
       var target = '#' + data.target + '_' + data.x + '_'+ data.y; 
       $(target).addClass('trafiony');
    }
};
var game;


var room='';
var myName='';
var ui = {
    toggleJoin: function(a) {
        if(a===0){
            $('#joinGame').hide();
        }
        else{
            $('#joinGame').show();
        }
    },
    setName: function(a){
        myName = a; 
        $('#myName').html('nick: ' + myName);
    },
    setRoom: function(a) {
        $('#gameField').html('');
        document.title=a+'(room)';
        room = a;
        $('#roomName').html('room: ' + a);
    },
    warn: function(a) {
        return  $('#warn').prepend('<p>' + a + '</p>');
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
        $('#initGame').remove();
        $('#shipsPlaced').remove();
        $('#gameMenu').append( '<input id="initGame" type="button" value="start"/>');
        $("#gameMenu").on('click', '#initGame', function(e) {
            initGame(room);
        });
    });
    $("#newRoom").on('click', function(e) {
        var name = ui.prompt('set new room name');
        addRoom(name);
    });
    $("#rooms").on('click', 'li', function(e) {
        joinRoom($(this).html());
    });
});
