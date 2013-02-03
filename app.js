
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/* === === === === === === === === === === === === === */
/* === === === === === === === === === === === === === */
/* === === === === === === === === === === === === === */

var io = require('socket.io').listen(server);
var players = {}; //player = {socket.id: {alive: true, position: {x: 0, y: 0}}}

io.sockets.on('connection', function(socket){
  socket.emit("afterConnect", players[socket.id] = {alive: true, position: {x: 0, y: 0}, spectator: true, connected: Date.now()});
  socket.emit("players", players);

  socket.on("eventPlayer", function(player){
    console.log(player);
    players[socket.id] = player;
    // rozesli to vsem ze se pohnul hrac
  });

  socket.on('disconnect', function () {
    delete players[socket.id];
    io.sockets.emit('afterDisconnect'); // odebrat hrace z mapy
  });
});
