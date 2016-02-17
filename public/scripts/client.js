var RIGHT_ARROW = 39;
var LEFT_ARROW = 37;
var UP_ARROW = 38;
var DOWN_ARROW = 40;

var A_KEY = 65;
var D_KEY = 68;
var W_KEY = 87;
var S_KEY = 83;

var inProgress = false; // if game is in progress
var timer; 
var canvas = document.getElementById('canvas1'); // canvas
var fontSize = 20; //
var font = 'Georgia Italic'; 

var player = {}; // main player
var playerList = []; // list of players
var npcList = []; // list of NPCs

var drawCanvas = function(){
    var context = canvas.getContext('2d');
	
	context.fillStyle = 'white';
	context.fillRect(0,0,canvas.width,canvas.height); //erase canvas
	
	if(!inProgress){ // initial screen
	    var display = "Please enter your name and press \"Join Game\" to join game";
		context.font = '' + fontSize + 'pt ' + font;
		context.fillStyle = 'black';
		context.strokeStyle = 'black';
		context.fillText(display, canvas.width/2 - context.measureText(display).width/2,canvas.height/2);
	}
	
	else{ // game in progress
	    
		for (var i=0; i < npcList.length; i++){ // draw NPCs
			context.beginPath();
			context.fillStyle = 'grey';
			context.arc(npcList[i].x,npcList[i].y,npcList[i].rad,0,2*Math.PI,false);
			context.closePath();
			context.fill();
		}
		
		for (var i=0; i < playerList.length; i++){ // draw other players
			if (playerList[i].id !== player.id){
				context.beginPath();
				context.fillStyle = 'LightBlue ';
				context.arc(playerList[i].x,playerList[i].y,playerList[i].rad,0,2*Math.PI,false);
				context.closePath();
				context.fill();
				context.font = '15pt Marlett';
				context.fillText(playerList[i].name,playerList[i].x - context.measureText(playerList[i].name).width/2,playerList[i].y - playerList[i].rad - 5); 
			}
		} 
		
		//draw main player
		context.beginPath();
		context.fillStyle = 'FireBrick';
		context.arc(player.x,player.y,player.rad,0,2*Math.PI,false);
		context.closePath();
		context.fill();
		context.font = '15pt Marlett';
		context.fillText(player.name,player.x - context.measureText(player.name).width/2,player.y - player.rad - 5);	
	}
}

/*---------------------------Adding Players----------------------------*/
function addPlayer(){
    if (!inProgress){
        var data = {};
        data.playerName = $("#name").val();
        var jsonString = JSON.stringify(data);
        
		socket.emit('addPlayer', jsonString);
    }  
	
	else {
        $("#name").val("You're already playing the game!");
    }    
}

socket.on('addResponse', function(data){
	var receivedData = data;
	
	if (receivedData.player) {
		player = receivedData.player;
		playerList = receivedData.playerList;
		inProgress = true;
		
		console.log("Player: \"", player.name, "\" added.");
		console.log('Player ID: ' + player.id);
		console.log("Player position: (", player.x, ", ", player.y, ")");
	}
});
/*-----------------------------------------------------------------------*/

/*---------------------------Removing Players----------------------------*/
function removePlayer(){    
    if (inProgress){	
		var dataObj = {id: player.id};   
		var jsonString = JSON.stringify(dataObj);
		
        socket.emit("removePlayer", jsonString);
		
		socket.on('removePlayerResponse', function (){
			player = {};
			inProgress = false;
			$("#name").val();
		});
    }   
}
/*-----------------------------------------------------------------------*/

/*-------------------------------Polling---------------------------------*/
function handleTimer(){
	var dataObj = {id:player.id};
	var jsonString = JSON.stringify(dataObj);
	socket.emit('updatePlayer', jsonString);
	
	socket.on('updatePlayerResponse', function(data){
		playerList = data.playerList;
		npcList = data.npcList;
		if(data.player)
			player = data.player;
		if(!player.alive)
			removePlayer();
	});
	
	drawCanvas();
}
/*-----------------------------------------------------------------------*/

/*---------------------------Updating Players---------------------------*/
function handleKeyDown(e){	
	var movement = 5; 
	
	if((e.which == UP_ARROW || e.which == W_KEY) && player.y - player.rad - movement >= 0) 
	   player.y -= movement;  	   
	if((e.which == RIGHT_ARROW || e.which == D_KEY) && player.x + player.rad + movement <= canvas.width) 
	   player.x += movement;  
	if((e.which == LEFT_ARROW || e.which == A_KEY) && player.x - player.rad - movement >= 0) 
	   player.x -= movement;  
	if((e.which == DOWN_ARROW || e.which == S_KEY) && player.y + player.rad + movement <= canvas.height) 
	   player.y += movement;  

	//upate server with position update
	var dataObj = {id: player.id, x: player.x, y: player.y};
	var jsonString = JSON.stringify(dataObj);

	socket.emit("updatePosition", jsonString, function(data, status){
		
	});  
    
}

function handleKeyUp(e){
	var dataObj = {id: player.id, x: player.x, y: player.y}; 
	var jsonString = JSON.stringify(dataObj);

	socket.emit("updatePosition", jsonString, function(data, status){
		
	});

} 
/*-----------------------------------------------------------------------*/

function handleMouseDown(e) {

}

window.onbeforeunload = function(){
   removePlayer();
}

$(document).ready(function(){
	$(document).keydown(handleKeyDown);
	$(document).keyup(handleKeyUp);
	$(document).mousedown(handleMouseDown);
	
	timer = setInterval(handleTimer, 100);  	
	drawCanvas();
});

