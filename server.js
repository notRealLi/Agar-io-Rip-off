var http = require('http'); 
var fs = require('fs'); 
var url = require('url');  
var Player = require('./Player'); // "Player class"
var Dot = require('./Dot'); // "NPC class"

var playerList = []; // list of players 
var maxPlayerNum = 8; // max number of players
var curPlayerNum = 0; // current number of players
var nextID = 0; // player IDs
var totalRad = 0; // total player cell size

var dotList = []; // list of NPCs 
var maxRad = 30; // max size of NPCs
var counter = 0; // counter for generating NPCs

for (var i=0; i < 30; i++){ // ininitialize some NPCs
	dotList[i] = new Dot(maxRad);
}

var ROOT_DIR = 'html'; //dir to serve static files from

var MIME_TYPES = {
    'css': 'text/css',
    'gif': 'image/gif',
    'htm': 'text/html',
    'html': 'text/html',
    'ico': 'image/x-icon',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'text/javascript', //should really be application/javascript
    'json': 'application/json',
    'png': 'image/png',
    'txt': 'text/text'
};

var get_mime = function(filename) {
    var ext, type;
    for (ext in MIME_TYPES) {
        type = MIME_TYPES[ext];
        if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
            return type;
        }
    }
    return MIME_TYPES['txt'];
};

http.createServer(function (request,response){
     var urlObj = url.parse(request.url, true, false);
     var receivedData = '';

     //attached event handlers to collect the message data
     request.on('data', function(chunk) {
        receivedData += chunk;
     });
	 
	 //event handler for the end of the message
     request.on('end', function(){		
		if(request.method == "POST"){
		   var dataObj = JSON.parse(receivedData);
		   var returnObj = {}
		  
          /*---------------------------Adding Players----------------------------*/		  
		  if (dataObj.request === "add"){ // add players
		        if (curPlayerNum < maxPlayerNum){                             
                    var player = new Player(dataObj.playerName, nextID);   		            
		            playerList.push(player);
                    
                    returnObj.player = player;
                    returnObj.playerList = playerList;
                    curPlayerNum++;
					nextID++;
                    
					console.log("/*------------New Player Joined------------*/");
		            console.log("Player: \"", player.name, "\" added.");
		            console.log("Player position: (", player.x, ", ", player.y, ")");
		            console.log("Current number of players: ", curPlayerNum);
					console.log("/*-----------------------------------------*/");
		        } 
		   } 
		   /*----------------------------------------------------------------------*/

		   /*---------------------------Updating Players---------------------------*/	
		   else if (dataObj.request === "update"){        
                for (var i=0; i < playerList.length; i++){
                    if (dataObj.id === playerList[i].id){         
                        playerList[i].x = dataObj.x;
                        playerList[i].y = dataObj.y;
                    }
                 }           
		   } 
		   /*-----------------------------------------------------------------------*/
		   
		   /*---------------------------Removing Players----------------------------*/
		   else if (dataObj.request === "remove"){
		        for (var i=0; i < playerList.length; i++){		        
                    if (dataObj.id === playerList[i].id){
						console.log("/*------------Player #", playerList[i].id," Disconnected------------*/");
						playerList.splice(i,1);
						curPlayerNum--;
						returnObj.playerList = playerList;
						break;
                    }
		        }           
		   }
		   /*-----------------------------------------------------------------------*/
		   
		   /*-------------------------------Polling---------------------------------*/
		   else if (dataObj.request === "poll") {
				counter++;
				totalRad = 0;
				
				if(playerList.length <= 0){ // re-ininitialize NPCs when all players quit
					dotList = [];
					maxRad = 30;
					for (var i=0; i < 30; i++)
						dotList[i] = new Dot(maxRad);
				}
				
				for (var k=0; k < playerList.length; k++) // calculating total player cell size
					totalRad += playerList[k].rad;
				
				if(playerList.length > 0) // setting max NPC cell size based on total player cell size
					maxRad = totalRad/playerList.length*2 + 5;
				
				if (counter%10 === 0) // generating new NPC
					dotList.push(new Dot(maxRad));
				
				for (var i=0; i < dotList.length; i++){ // check collisions between players and NPCs
					for (var j=0; j < playerList.length; j++)
						playerList[j].collision(dotList[i]);

					if(dotList[i].alive)
						dotList[i].wander();
					else
						dotList.splice(i,1);
				}
				
				for(var x=0;x < playerList.length-1;x++){ // check collisions between players
					for(var y=x+1;y < playerList.length;y++){
						if(playerList[x].alive)
							playerList[x].collision(playerList[y]);
					}
				}
				
				for (var j=0; j < playerList.length; j++){ // main player	
                    if (dataObj.id === playerList[j].id){
						returnObj.player = playerList[j];
						break;
					}		
				}
				
				returnObj.playerList = playerList;
				returnObj.dotList = dotList;		        
		   }
		   /*-----------------------------------------------------------------------*/

           response.writeHead(200, {'Content-Type': MIME_TYPES["json"]}); 
           response.end(JSON.stringify(returnObj)); //send just the JSON object
		}
     });
	 
     if(request.method == "GET"){
	 //handle GET requests as static file requests
     fs.readFile(ROOT_DIR + urlObj.pathname, function(err,data){
       if(err){
		  //report error to console
          console.log('ERROR: ' + JSON.stringify(err));
          response.writeHead(404);
          response.end(JSON.stringify(err));
          return;
         }
         response.writeHead(200, {'Content-Type': get_mime(urlObj.pathname)});
         response.end(data);
       });
	 }


 }).listen(3000);
 

console.log('Server Running at http://127.0.0.1:3000  CNTL-C to quit');
