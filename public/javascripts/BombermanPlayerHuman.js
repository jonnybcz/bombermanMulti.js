/**
* author: topa
* @class Třída Bomberman.Player.Human
*/
Bomberman.Player.Human = JAK.ClassMaker.makeClass({
	NAME: "Bomberman.Player.Human",
	VERSION: "1.0",
	EXTEND: Bomberman.Player
});

Bomberman.Player.Human.prototype.$constructor = function(nick, map){
	this.$super(nick, map);
	this._keyboardEvent = JAK.Events.addListener(window, "keydown", this, "_move");
}

Bomberman.Player.Human.prototype.kill = function(){
	JAK.Events.removeListeners([this._keyboardEvent]);
	var audio = JAK.ServiceLocator.getService("audio");
	audio.play("killPlayer");
	
	this._dead = true;
}

Bomberman.Player.Human.prototype._move = function(e, elm){
	switch (e.keyCode) {
		case 65: // A 
		case 37:
			this._makeStep("left");
			break;
		case 68: // D
		case 39: 
			this._makeStep("right");
	      		break;
	      	case 87: // W
		case 38: 
			this._makeStep("up");
	      		break;
	      	case 83: // S
		case 40: 
			this._makeStep("down");
	      		break;
      		case 32: // space
      			this._putBomb();
      			break;
	   default:
		break;
	}
}