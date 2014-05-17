var express = require('express');
var path = require('path');
var less = require('less-middleware');

var app = express();
var routes = require('./routes/index');
var game = require('./routes/game');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(less(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components/jquery/dist')));

app.use('/', routes);
app.use('/game', game);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});

var socket = require('./socket');
socket.socketServer(app, server);
