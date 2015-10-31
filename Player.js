
var Class = function(playerName, playerID){   
    this.name = playerName;
	this.id = playerID;
	this.rad = 20.00;
    this.x = Math.random()*(800 - this.rad*2)+this.rad;
    this.y = Math.random()*(600 - this.rad*2)+this.rad;
	this.alive = true;
}

Class.prototype.collision = function(thing) {
	
	if(Math.abs(this.x - thing.x) <= this.rad/2 &&
	   Math.abs(this.y - thing.y) <= this.rad/2) {
		    if (this.rad >= thing.rad*2) { // when size of this is greater than the other player or NPC 
				this.rad += 1+Math.floor(thing.rad/8 + 0.5);
				thing.alive = false;
			}
			
			else if (this.rad <= thing.rad/2){ // when size of this is less than the other 
				if(thing.isDot) // NPC
					this.rad--;
				else // player
					this.alive = false;
			}
	   }
}

module.exports = Class;

