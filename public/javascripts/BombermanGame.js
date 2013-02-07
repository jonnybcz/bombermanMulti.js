/**
* author: topa
* @class Třída Bomberman.Game
*/
Bomberman.Game = JAK.ClassMaker.makeClass({
	NAME: "Bomberman.Game",
	VERSION: "1.0"
});

Bomberman.Game.prototype.$constructor = function(playersDiv){
	this._playersDiv = playersDiv;
	this._playingPlayersCount = 0;
	this._playingPlayers = {};
}

Bomberman.Game.prototype.start = function(playingPlayers){
	this._playingPlayersCount = this._countPlayers(playingPlayers);
	this._plaingPlayers = playingPlayers;
	JAK.DOM.addClass(this._playersDiv, "hide");

	var bombermanMap = new Bomberman.Map(JAK.gel("cns"), JAK.gel("game"), this._playingPlayersCount);

	for (var key in playingPlayers) {
		var player = playingPlayers[key];

		bombermanMap.addPlayer(new Bomberman.Player.Human(player, bombermanMap));
	}


}

Bomberman.Game.prototype.end = function(){
	JAK.DOM.removeClass(this._playersDiv, "hide");
	console.log("hra konci");
}

Bomberman.Game.prototype.playersUpdate = function(players){
	var playersTable = JAK.gel("playersTable");
        var table = new CreatorTable("players");

        table.setColumns({id: "id", connected: "Connected", spectator: "Spectator"});

        for(var key in players) table.addRow({id: key.substr(0, 5), connected: players[key].connected, spectator: players[key].spectator });

        var tableHTML = table.toHTML();
        tableHTML.className = "table";
        JAK.DOM.clear(playersTable);
        playersTable.appendChild(tableHTML);
}

Bomberman.Game.prototype._countPlayers = function(players){
	var i = 0;

	for (var key in players) i++;

	return i;
}