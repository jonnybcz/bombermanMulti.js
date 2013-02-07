
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
var playersCount = 0;
var gameIsRunning = false;

var game = {
  setPosition: function(players){
    var position = 0;
    for (var key in players) {
      players[key].position = position;
    }
  }
};

io.sockets.on('connection', function(socket){
  socket.emit("afterConnect", players[socket.id] = {alive: true, position: {x: 0, y: 0}, spectator: true, connected: Date.now()});
  io.sockets.emit("players", players);
  playersCount++;

  function startGame(){
    gameIsRunning = true;
    io.sockets.emit("startGame", game.setPosition(players));
  }

  function endGame(){
    gameIsRunning = false;
  }

  if (playersCount >= 2 /*&& !gameIsRunning*/) startGame();

  if (playersCount < 2 && gameIsRunning) endGame();

  socket.on("eventPlayer", function(player){
    players[socket.id] = player;
  });

  socket.on('disconnect', function () {
    delete players[socket.id];
    playersCount--;
    io.sockets.emit('afterDisconnect'); // odebrat hrace z mapy
    io.sockets.emit("players", players);
  });
});
