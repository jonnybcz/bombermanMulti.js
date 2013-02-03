/**
* author: topa
* @class Třída Bomberman.SocketIO
*/
Bomberman.SocketIO = JAK.ClassMaker.makeClass({
	NAME: "Bomberman.SocketIO",
	VERSION: "1.0"
});

Bomberman.SocketIO.prototype.$constructor = function(urlAddress){
	this._socket = io.connect(urlAddress);
}

Bomberman.SocketIO.prototype.getSocket = function(){
	return this._socket;
}

Bomberman.SocketIO.prototype._serverReturnPlayer = function(player){
	console.log(player);	
}

Bomberman.SocketIO.prototype.playerEvent = function(player){
	this._socket.emit('eventPlayer', player);
}
