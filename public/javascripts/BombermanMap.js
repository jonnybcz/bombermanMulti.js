/**
* author: topa
* @class Třída Bomberman.Map
*/
Bomberman.Map = JAK.ClassMaker.makeClass({
	NAME: "Bomberman.Map",
	VERSION: "1.0"
});

Bomberman.Map.prototype.$constructor = function(canvas, gameBoard, countPlayers){
	this._gameMapSize = {x: gameBoard.offsetWidth, y: gameBoard.offsetHeight};
	this._canvas = canvas;
	this._gameBoard = gameBoard;
	this._countPlayers = countPlayers;

	this._cellSize = 40;
	this._columns = 13;
	this._rows = 13;
	this._width = this._cellSize * this._rows;
	this._height = this._width;

	this._gameBoard.style.width = this._width.toString() + "px";
	this._gameBoard.style.height = this._height.toString() + "px";

	//this._setInitSizeAndColumns();
	this._setCenterGameWindow();
	
	this._stones = [];
	this._boxes = [];
	this._bombs = [];
	this._explosions = []; // tady se presouva po vybuchnuti bomba
	this._players = [];
	this._respawns = [];

	this._canvas.width = this._width;
	this._canvas.height = this._height;
	
	this._buildStones();
	this._createRespawns();
	//this._buildBoxesAndDoor();

	this._render = new Bomberman.Map.Render(this);
	this._render._renderPermanentThings(); //stones, doors, etc..
}

/* NOVE FUNKCE */
Bomberman.Map.prototype._setInitSizeAndColumns = function(){
	var defaultCellSize = 30; //px
	var width = Math.ceil(this._gameMapSize.x);
	var height = Math.ceil(this._gameMapSize.y);
	var maxWidth = 0;
	var maxHeight = 0;
	var columns = 0;
	var rows = 0;
		
	while(width > maxWidth) maxWidth += defaultCellSize;
	while(height > maxHeight) maxHeight += defaultCellSize;

	maxWidth -= defaultCellSize;
	maxHeight -= defaultCellSize;

	columns = maxWidth / defaultCellSize;
	rows = maxHeight / defaultCellSize;

	while(columns % 2){
		maxWidth -= defaultCellSize;
		columns = maxWidth / defaultCellSize
	}

	while(rows % 2){
		maxHeight -= defaultCellSize;
		rows = maxHeight / defaultCellSize
	}
	console.log(columns);
	this._width = maxWidth - defaultCellSize;
	this._height = maxHeight - defaultCellSize;
	this._cellSize = defaultCellSize;
	this._columns = columns;
	this._rows = rows;
}

Bomberman.Map.prototype._setCenterGameWindow = function(){
	this._canvas.style.top = "50%";
	this._canvas.style.left = "50%";
	this._canvas.style.marginLeft = this._width / 2 * -1 + "px";
	this._canvas.style.marginTop = this._height / 2 * -1 + "px";
}
/* ****** */ 

Bomberman.Map.prototype.getCanvas = function(){
	return this._canvas;
}

Bomberman.Map.prototype.getRespawns = function(){
	return this._respawns;
}

Bomberman.Map.prototype.getStones = function(){
	return this._stones;
}

Bomberman.Map.prototype.getPlayers = function(){
	return this._players;
}

Bomberman.Map.prototype.getBombs = function(){
	return this._bombs;
}

Bomberman.Map.prototype.getExplosions = function(){
	return this._explosions;
}

Bomberman.Map.prototype.getBoxes = function(){
	return this._boxes;
}

Bomberman.Map.prototype.getCellSize = function(){
	return this._cellSize;
}

Bomberman.Map.prototype.removeBox = function(position, explosion){
	var boxes = this.getBoxes();
	var tmp = [];

	for (var i = 0; i < boxes.length; i++) {
		var box = boxes[i];
		var boxPos = boxes[i].getPosition();

		if(boxPos.x == position.x && boxPos.y == position.y) box.setTimeDisappear(explosion.getExplosionTimeTo());
	}
}

Bomberman.Map.prototype._removeDisapperedBoxes = function(){
	var boxes = this.getBoxes();
	var tmp = [];

	for (var i = 0; i < boxes.length; i++) {
		if (boxes[i].canIDisappear()) tmp.push(i);
	}	

	boxes.removeIndexes(tmp);
}

Bomberman.Map.prototype._removePlayers = function(position){
	var players = this.getPlayers();
	var countMonsters = 0;
	var tmp = [];

	for (var i = 0; i < players.length; i++) {
		var player = players[i];

		if(player.isDead()) tmp.push(i);

		if(player instanceof Bomberman.Player.Human && player.isDead())	this._GO();
		if(player instanceof Bomberman.Player.Monster && player.isDead()) this._countMonsters--;
	}

	players.removeIndexes(tmp);
}

Bomberman.Map.prototype.refresh = function(){
	var players = this._players;
	this._removeExplodedBombs();
	this._removeExplosions();
	this._killPlayers();
	this._removeDisapperedBoxes();
	this._removePlayers();
	this._win();

	for (var i = 0; i < players.length; i++) {
		if(players[i] instanceof Bomberman.Player.Monster) players[i].generateMove();
	}
	
	this._render.canvas();
}

Bomberman.Map.prototype._win = function(){

}

Bomberman.Map.prototype._GO = function(){

}

Bomberman.Map.prototype._createRespawns = function(){
	var cellSize = this._cellSize;
	var columns = this._columns;
	var rows = this._rows;
	var bottom = rows * cellSize - cellSize * 2;
	var right = cellSize * columns - cellSize * 2;

	var positions = [
		{x: cellSize, y: cellSize}, {x: cellSize * 2, y: cellSize}, {x: cellSize, y: cellSize * 2}, //leftCornerTop
		{x: right, y: cellSize}, {x: cellSize * columns - cellSize * 3, y: cellSize}, {x: right, y: cellSize * 2}, //RightCornerTop
		{x: cellSize * ((columns - 1)/2), y: cellSize}, {x: cellSize * ((columns - 1)/2) - cellSize, y: cellSize}, {x: cellSize * ((columns - 1)/2) - cellSize, y: cellSize * 2}, //TopMiddle
		{x: cellSize * ((columns - 1)/2), y: cellSize}, {x: cellSize * ((columns - 1)/2) - cellSize, y: cellSize}, {x: cellSize * ((columns - 1)/2) - cellSize, y: cellSize * 2}, //middle left border

		{x: cellSize, y: bottom}, {x: cellSize, y: rows * cellSize - cellSize * 3}, {x: cellSize * 2, y: bottom}, //leftCornerBottom
		{x: right, y: bottom}, {x: cellSize * columns - cellSize * 3, y: bottom}, {x: right, y: rows * cellSize - cellSize * 3}, //RightCornerBottom
		{x: cellSize * ((columns - 1)/2), y: bottom}, {x: cellSize * ((columns - 1)/2) - cellSize, y: bottom}, {x: cellSize * ((columns - 1)/2) - cellSize, y: rows * cellSize - cellSize * 3}, //MiddleBottom
		{x: cellSize * ((columns - 1)/2), y: cellSize}, {x: cellSize * ((columns - 1)/2) - cellSize, y: cellSize}, {x: cellSize * ((columns - 1)/2) - cellSize, y: cellSize * 2}, //middle left border

		{x: cellSize, y: ((rows - 1)/2) * cellSize}, {x: cellSize, y: ((rows - 1)/2) * cellSize - cellSize}, {x: cellSize * 2, y: ((rows - 1)/2) * cellSize - cellSize}, //left border middle

		{x: right, y: ((rows - 1)/2) * cellSize}, {x: right, y: ((rows - 1)/2) * cellSize - cellSize}, {x: right - cellSize, y: ((rows - 1)/2) * cellSize - cellSize} //right border middle
	];
	

 	
	for (var i = 0; i < positions.length; i++) {
		this._respawns.push(new Bomberman.Respawn(positions[i], cellSize));
	}
}

Bomberman.Map.prototype._killPlayers = function(){
	var explosionsMatrix = this.getExplosions();
	var explosions = [];
	var players = this.getPlayers();
	var bombs = this.getBombs();

	/* EXPLOSION BOMB */
	for (var i = 0; i < explosionsMatrix.length; i++) {
		var explCoords = explosionsMatrix[i].getCoordinates();

		for (var j = 0; j < explCoords.length; j++) {
			explosions.push(explCoords[j]);
		}
	}

	for (var i = 0; i < explosions.length; i++) {
		var explosion = explosions[i];

		for (var j = 0; j < players.length; j++) {
			var player  = players[j];
			var playerPos = player.getPosition();

			if(playerPos.x == explosion.x && playerPos.y == explosion.y) player.kill();
		}

		for (var j = 0; j < bombs.length; j++) {
			var bomb = bombs[j];
			bombPos = bomb.getPosition();

			if(bombPos.x == explosion.x && bombPos.y == explosion.y) bomb.isTimeForBoom(true);
		}
	}
	/* KILLED BY MONSTER */
	var humans = [];

	for (var i = 0; i < players.length; i++) {
		if(players[i] instanceof Bomberman.Player.Human) humans.push(players[i]);
	}

	for (var i = 0; i < humans.length; i++) {
		var humanPos = humans[i].getPosition();

		for (var j = 0; j < players.length; j++) {
			var playerPos = players[j].getPosition();

			if(players[j] instanceof Bomberman.Player.Monster && humanPos.x == playerPos.x && humanPos.y == playerPos.y) humans[i].kill();
		}
	}


}

Bomberman.Map.prototype._removeExplodedBombs = function(){
	var bombs = this._bombs;
	var tmp = [];

	for (var i = 0; i < bombs.length; i++) if(bombs[i].isExploded()) tmp.push(i);
		
	for (var i = 0; i < tmp.length; i++){
		this._explosions.push(new Bomberman.Player.Bomb.Explosion(bombs[i]));
	}

	bombs.removeIndexes(tmp);
}

Bomberman.Map.prototype._removeExplosions = function(){
	var explosions = this._explosions;
	var tmp = [];

	for (var i = 0; i < explosions.length; i++) if(!explosions[i].runs()) tmp.push(i);

	explosions.removeIndexes(tmp);	
}

Bomberman.Map.prototype._buildStones = function(){
	var columns = this._columns;

	// top wall
	for (var i = 0; i < columns; i++) this._stones.push(new Bomberman.Stone({x: (i * this._cellSize), y: 0}, this._cellSize));
	// bottom wall
	for (var i = 0; i < columns; i++) this._stones.push(new Bomberman.Stone({x: (i * this._cellSize), y: (this._height - this._cellSize)}, this._cellSize));
	// left wall
	for (var i = 0; i < columns; i++) this._stones.push(new Bomberman.Stone({x: 0, y: (this._cellSize * i)}, this._cellSize));
	// right wall
	for (var i = 0; i < columns; i++) this._stones.push(new Bomberman.Stone({x: (this._width - this._cellSize), y: (this._cellSize * i)}, this._cellSize));
	// buildStones rows
	for (var i = 1; i < this._columns; i++) {
		for (var j = 1; j < this._rows; j++) {
			if(i % 2 && j % 2) this._stones.push(new Bomberman.Stone({x: (i+1) * this._cellSize, y: (j+1) * this._cellSize}, this._cellSize));
		}
	}	
}

Bomberman.Map.prototype._buildBoxesAndDoor = function(){
	var boxes = this._boxes;
	var columns = this._columns;
	var rows = this._rows;
	var cellSize = this._cellSize;
	var chancePutBox = 9; // 0 / 10 , cim vetsi cislo tim vetsi sance na polozeni bednicky
	var existDoor = false;

	for (var i = 1; i <= columns; i++) {
		for (var j = 1; j <= rows; j++) {
			var pos = {x: i * cellSize, y: j * cellSize};
			if(this._isCellEmpty(pos) && Math.random() * (10 - 0) + 0 < chancePutBox) boxes.push(new Bomberman.Box(pos, cellSize));
		
		}
	}

	
}


Bomberman.Map.prototype._removeBoxesAroundPlayer = function(playerPos){
	var boxes = this._boxes;
	var cellSize = this._cellSize;
	var tmp = [];

	for (var i = 0; i < boxes.length; i++) {
		var boxPos = boxes[i].getPosition();

		if(playerPos.x + (1 * cellSize) == boxPos.x && playerPos.y == boxPos.y) tmp.push(i);
		if(playerPos.x - (1 * cellSize) == boxPos.x && playerPos.y == boxPos.y) tmp.push(i);
		if(playerPos.x == boxPos.x && playerPos.y + (1 * cellSize) == boxPos.y) tmp.push(i);
		if(playerPos.x == boxPos.x && playerPos.y - (1 * cellSize) == boxPos.y) tmp.push(i);
	}

	var diff = 0;
	for (var i = 0; i <= tmp.length; i++){
		boxes.splice(tmp[i] - diff, 1);	
		diff++;
	} 
}

Bomberman.Map.prototype.addPlayer = function(player){
	//player.setPosition(respawnPos);
	//this._players.push(player);
	//this._removeBoxesAroundPlayer(player.getPosition());

	//if (player instanceof Bomberman.Player.Monster) this._countMonsters++;
}

Bomberman.Map.prototype.canIMoveThere = function(direction, player){
	var pos = player.getPosition();

	switch (direction) {
		case "left":
		   	var nPos = {x: pos.x - this._cellSize, y: pos.y};
		   	
		   	if(this._isCellEmpty(nPos)) player.setPosition(nPos);
		      	
		      	break;

		case "right":
			var nPos = {x: pos.x + this._cellSize, y: pos.y};
		   	
			if(this._isCellEmpty(nPos)) player.setPosition(nPos);
		      	
			break;

		case "up":
			var nPos = {x: pos.x, y: pos.y - this._cellSize};
		   	
			if(this._isCellEmpty(nPos)) player.setPosition(nPos);
		      	
			break;

		case "down":
			var nPos = {x: pos.x, y: pos.y + this._cellSize};
		   	
			if(this._isCellEmpty(nPos)) player.setPosition(nPos);
		      	
			break;

	default:
	
		break;
	}

	return true; // @todo
}

Bomberman.Map.prototype.placeBomb = function(bomb, player){
	this._bombs.push(bomb);
}

Bomberman.Map.prototype.isOnCellStone = function(position){
	var stones = this.getStones();

	for (var i = 0; i < stones.length; i++) {
		var stonePos = stones[i].getPosition();

		if(stonePos.x == position.x && stonePos.y == position.y) return true;
	}

	return false;
}

Bomberman.Map.prototype.isOnCellBox = function(position){
	var boxes = this.getBoxes();

	for (var i = 0; i < boxes.length; i++) {
		var boxPos = boxes[i].getPosition();

		if(boxPos.x == position.x && boxPos.y == position.y) return true;
	}

	return false;
}

// neni nic na teto pozici ? kamen, bomba, hrac ....
Bomberman.Map.prototype._isCellEmpty = function(position){
	var stones = this.getStones();
	var bombs = this.getBombs();
	var boxes = this.getBoxes();
	var players = this.getPlayers();

	for (var i = 0; i < stones.length; i++) {
		var stonePos = stones[i].getPosition();
		if(stonePos.x == position.x && stonePos.y == position.y) return false;
	}

	for (var i = 0; i < bombs.length; i++) {
		var bombPos = bombs[i].getPosition();
		if(bombPos.x == position.x && bombPos.y == position.y) return false;
	}

	for (var i = 0; i < boxes.length; i++) {
		var boxPos = boxes[i].getPosition();
		if(boxPos.x == position.x && boxPos.y == position.y) return false;
	}

	/*for (var i = 0; i < players.length; i++) {
		var playerPos = players[i].getPosition();
		if(playerPos.x == position.x && playerPos.y == position.y) return false;
	}*/

	return true;

	// proiteruje a udela pruniky pres vsechny kameny

	// proiteruje a udela priniky pres vsechny bednicky
}

