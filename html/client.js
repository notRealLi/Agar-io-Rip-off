var display = "Please enter your name and press \"Join Game\" to join game";

var inProgress = false; // if game is in progress
var player = {}; // main player
var playerList = []; // list of players
var mousePos = {};

var dotList = []; // list of NPCs
					
var timer; 
var pollingTimer; 

var canvas = document.getElementById('canvas1'); // canvas
var fontSize = 20; //
var font = 'Georgia Italic'; 


var drawCanvas = function(){
    var context = canvas.getContext('2d');
	
	context.fillStyle = 'white';
	context.fillRect(0,0,canvas.width,canvas.height); //erase canvas
	
	if(!inProgress){ // initial screen
		context.font = '' + fontSize + 'pt ' + font;
		context.fillStyle = 'black';
		context.strokeStyle = 'black';
		context.fillText(display, canvas.width/2 - context.measureText(display).width/2,canvas.height/2);
	}
	else{ // game in progress
		for (var i=0; i < dotList.length; i++){ // draw NPCs
			context.beginPath();
			context.fillStyle = 'grey';
			context.arc(dotList[i].x,dotList[i].y,dotList[i].rad,0,2*Math.PI,false);
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

function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }

function handleTimer(){
	drawCanvas()
}

	var RIGHT_ARROW = 39;
	var LEFT_ARROW = 37;
	var UP_ARROW = 38;
	var DOWN_ARROW = 40;

/*---------------------------Adding Players----------------------------*/
function addPlayer(){
    if (!inProgress){
        var dataObj = {request: "add"};
        dataObj.playerName = $("#name").val();
        var jsonString = JSON.stringify(dataObj);
        
        $.post("addPlayer", jsonString, function(data, status){

			var responseObj = data;
			//var responseObj = JSON.parse(data);
			if(responseObj.player)	
				player = responseObj.player;
				playerList = responseObj.playerList;
				console.log("Player: \"", player.name, "\" added.");
		        console.log("Player position: (", player.x, ", ", player.y, ")");
				inProgress = true;
				display = dataObj.name;
        });
    }  
	
	else {
        $("#name").val("You're already playing the game!");
    }    
}
/*-----------------------------------------------------------------------*/

/*---------------------------Removing Players----------------------------*/
function removePlayer(){    
    if (inProgress){
		var dataObj = {request: "remove", id: player.id};   
		var jsonString = JSON.stringify(dataObj);
		
        $.post("removePlayer", jsonString, function(data,status){
			console.log(data.text);
			player = {};
			playerList = data.playerList;
			inProgress = false;
			display = "Please enter your name and press \"Join Game\" to join game";
			$("#name").val();
			drawCanvas();      
        });
    }   
}
/*-----------------------------------------------------------------------*/

/*-------------------------------Polling---------------------------------*/
function pollingTimerHandler(){
	//console.log("poll server");
	var dataObj = {request: "poll", id: player.id}; //used by server to react as poll
	var jsonString = JSON.stringify(dataObj);	
  
   //poll the server for the player array
	$.post("Poll", jsonString, function(data, status){
				playerList = data.playerList;
				dotList = data.dotList;
				
				if(data.player)
					player = data.player;
				if(!player.alive)
					removePlayer();
			});
}
/*-----------------------------------------------------------------------*/

/*---------------------------Updating Players---------------------------*/
function handleKeyDown(e){	
	//console.log("keyCode: " + e.which);
	var movement = 5; 
	
	if(e.which == UP_ARROW && player.y - player.rad - movement >= 0) 
	   player.y -= movement;  	   
	if(e.which == RIGHT_ARROW && player.x + player.rad + movement <= canvas.width) 
	   player.x += movement;  
	if(e.which == LEFT_ARROW && player.x - player.rad - movement >= 0) 
	   player.x -= movement;  
	if(e.which == DOWN_ARROW && player.y + player.rad + movement <= canvas.height) 
	   player.y += movement;  

	//upate server with position update
	var dataObj = player;
	dataObj.request = "update";
	var jsonString = JSON.stringify(dataObj);

	$.post("positionData",
	    jsonString, 
		function(data, status){
		});  
    
}

function handleKeyUp(e){
	//console.log("key UP: " + e.which);
	var dataObj = {id: player.id, x: player.x, y: player.y}; 
	dataObj.request = "update";
	var jsonString = JSON.stringify(dataObj);

	$.post("positionData",
	    jsonString, 
		function(data, status){
		});

} 
/*-----------------------------------------------------------------------*/

function handleMouseMove(e) {
	mousePos = getMousePos(canvas,e);
	//console.log(mousePos.x + " " + mousePos.y);
}

function handleMouseDown(e) {
	console.log("dot#: ", dotList.length);
	console.log("Rad: ", player.rad);
}

window.onbeforeunload = function(){
   removePlayer();
}

$(document).ready(function(){
	$(document).keydown(handleKeyDown);
	$(document).keyup(handleKeyUp);
	$(document).mousemove(handleMouseMove);
	$(document).mousedown(handleMouseDown);
	
	timer = setInterval(handleTimer, 100); 
	pollingTimer = setInterval(pollingTimerHandler, 300);  
	
	drawCanvas();
});

