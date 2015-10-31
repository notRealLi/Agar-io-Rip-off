
var Class = function(max){   
	this.rad = Math.random()*max + 1.00;
    this.x = Math.random()*760+20;
    this.y = Math.random()*560+20;
	this.speedX = Math.random()*8-4;
	this.speedY = Math.random()*8-4;
	this.step = 0; // step counter 
	this.maxStep = Math.random()*40+50; // max steps to take before changing direction
	this.alive = true;
	this.isDot = true;
}

Class.prototype.wander = function() {
	
	 if (this.step >= this.maxStep) { // change moving direction
      this.speedX = Math.random()*8-4;
      this.speedY = Math.random()*8-4;
      this.step = 0;
      this.maxStep = Math.random()*40+50;
    }
	
	this.x += this.speedX;
    this.y += this.speedY;
	
	this.step++;
}

module.exports = Class;