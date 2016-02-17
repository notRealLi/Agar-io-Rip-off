var express = require('express');
var Player = require("./modules/Player.js");
var NPC = require("./modules/Cell.js");

var app = express();
var server = require('http').createServer(app);
server.listen(3000);

var io = require('socket.io')(server);

var playerList = [];
var playerCount = 0;
var playerIDGen = 0;

var npcList = [];
var npcRadLimit = 30;
var npcSpawnCounter = 0;

for (var i=0; i < 30; i++) {
	npcList.push(new NPC(npcRadLimit));
}

app.use(express.static(__dirname));

io.on('connection', function(client){
	console.log("Client connected!");
	
	client.on('addPlayer', function (data) {
		var data = JSON.parse(data);
		playerList[playerCount++] = new Player(data.playerName, playerIDGen++); // create a new player and add it to the server playerList
		console.log(playerList[playerCount-1]);  // print new player info to the console
		
		client.emit('addResponse', {player: playerList[playerCount-1], playerList: playerList}); // respond with the newly added player and the current playerList
	})
	
	client.on('updatePlayer', function(data){
		var data = JSON.parse(data);
		var resData = {playerList: playerList, npcList: npcList};
		for (var i=0; i < playerList.length; i++){
			if (data.id == playerList[i].id) {
				resData.player = playerList[i];
				break;
			}
		}
		
		client.emit('updatePlayerResponse', resData);
	})
	
	client.on('updatePosition', function(data){
		var data = JSON.parse(data);
		
		for (var i=0; i < playerList.length; i++){
			if (data.id == playerList[i].id) {
				playerList[i].x = data.x;
				playerList[i].y = data.y;
				break;
			}
		}
	})
	
	client.on('removePlayer', function(data){
		var data = JSON.parse(data);
		
		for (var i=0; i < playerList.length; i++){
			if (data.id == playerList[i].id) {
				console.log('remove')
				playerList.splice(i,1);
				playerCount--;
				client.emit('removePlayerResponse');
				break;
			}
		}
	});
});

timer = setInterval(function(){
	if(playerList.length > 0){ // setting max NPC cell size based on total player cell size
		var totalRad = 0;
		for (var i=0; i < playerList.length; i++) // calculating total player cell size
			totalRad += playerList[i].rad;
		maxRad = totalRad/playerList.length*2 + 5;
	}
	
	for (var i=0; i < npcList.length; i++){ // check collisions between players and NPCs
		for (var j=0; j < playerList.length; j++)
			playerList[j].collision(npcList[i]);

		if(npcList[i].alive)
			npcList[i].wander();
		else
			npcList.splice(i,1);
	}
	
	for(var x=0;x < playerList.length-1;x++){ // check collisions between players
		for(var y=x+1;y < playerList.length;y++){
			if(playerList[x].alive)
				playerList[x].collision(playerList[y]);
		}
	}
	
	if (npcSpawnCounter%30 === 0) // generating new NPC
		npcList.push(new NPC(npcRadLimit));
		
	if(playerList.length <= 0){ // re-ininitialize NPCs when all players quit
		npcList = [];
		maxRad = 30;
		for (var i=0; i < 30; i++)
			npcList[i] = new NPC(maxRad);
	}
	
	npcSpawnCounter++;
}, 100); 

app.get('/index', function(request, response){
  response.sendFile(__dirname + '/public/html/index.html');
});

console.log("Server running!");


