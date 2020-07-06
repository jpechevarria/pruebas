var w = 400;
var h = 400;

var cantBubbles = 1;
var bubSize = 20;
var bubbles = [];
var fr = 25;

var viscocidad = 0.995;
var G = 4;
var perdidaRebote = 0.9;
var count= 0;
var countToca= 0;

var hLimitT = bubSize/2;
var hLimit = h-bubSize/2;
var wLimitL = bubSize/2;
var wLimitR = w-bubSize/2;


function setup() {
	cnv = createCanvas(w,h);
	var x = (windowWidth - w) / 2;
  var y = (windowHeight - h) / 2;
  cnv.position(x, y);
	background(0, 0, 0);
	gravity = createVector(0,G);
	for ( var i = 0 ; i < cantBubbles ; i++ )
	{
		var b = new Bubble()
		bubbles.push(b)
		b.color = color(255,0,0);
	}
	valP = createP();
	tocaP = createP();
}

function draw() {
	frameRate(fr);
	count++;
	background(127);
	for( var i = 0 ; i < bubbles.length ; i++ )
	{
		var b = bubbles[i];
		b.animate();
		b.show();
		if ( i == 0 ){
			console.log(b.velocity.mag(), b.acceleration.mag());
			//console.log(b.velocity , b.acceleration, b.moving);
			//console.log(b.energy);
			console.log('moving:' + b.moving);
		}
	}
	valP.html(count);
}

function Bubble(){
	this.pos = createVector(250, 100);
	this.velocity = createVector(random(-0, +0),random(0, 0));
	this.acceleration = gravity;
	this.color = 0;
	this.moving = true;
	
	this.animate = function () {
		
		//console.log('inicial:', this.pos.y);
		//console.log('vel:', this.velocity.y);
		
		if ( !this.moving )
			return;
		
		
		this.acceleration = gravity;

		// SI CON LA VELOCIDAD ACTUAL TOCA EL FONDO LA ACTUALIZACION ES DIFERENTE
		//this.velocity.add(this.acceleration);
		var estimatePos = p5.Vector.add(this.pos,this.velocity);
		if ( estimatePos.y >= hLimit ) {
			countToca++;
			tocaP.html(countToca);
			var coef = (hLimit - this.pos.y) / this.velocity.y;
			this.velocity.add(p5.Vector.mult(this.acceleration,coef));
			this.velocity.y *= -1;
			this.velocity.add(p5.Vector.mult(this.acceleration,(1-coef)));
			this.pos.y = hLimit;
			console.log('coef', coef);
		}
		else {
			this.velocity.add(this.acceleration);
		}
		this.pos.add(this.velocity);


		//console.log('mueve:', this.pos.y);

		var rebote = false;
		// REBOTE CON EL FONDO
		if ( this.pos.y > hLimit || this.pos.y < hLimitT )
		{
			rebote = true;
			if ( this.pos.y > hLimit ) {
				this.pos.y = hLimit - (this.pos.y-hLimit);
			}
			else if ( this.pos.y < hLimitT ){
				this.pos.y = hLimitT + (hLimitT-this.pos.y);
			}
			
			this.velocity.y *= -1;
		}
		// REBOTE CON LOS LATERALES
		if ( this.pos.x < wLimitL || this.pos.x > wLimitR )
		{
			rebote = true;
			if ( this.pos.x < wLimitL ) {
				this.pos.x = wLimitL + (wLimitL-this.pos.x);
			}
			else if ( this.pos.x > wLimitR ){
				this.pos.x = wLimitR - (this.pos.x-wLimitR);
			}
			this.velocity.x *= -1;
		}
		
		//console.log('rebote:', this.pos.y);
		
		// REDUCE LA VELOCIDAD POR REBOTE
		mag = this.velocity.mag();
		if ( rebote ) {
			mag *= perdidaRebote;
		}
		
		// REDUCE LA VELOCIDAD POR VISCOSIDAD
		viscocidad = sigmoidViscosidad(mag);
		mag *= sigmoidViscosidad(mag);

		// SI LA VELOCIDAD ES MENOR A 1 ENTONCES SE DETUVO		
		if ( mag < 1 )
		{
			mag = 0;
		}
		this.velocity.setMag(mag);

		// DETENIDO
		if ( this.pos.y > hLimit && mag <= 1 && rebote ) {
			this.moving = false;
		}
		
		// CALCULA EL COLOR SEGUN LA ENERGIA
		this.energy = 0.5 * mag * mag;
		this.energy += ((h-bubSize/2)-this.pos.y) * gravity.mag();
		//console.log((this.pos.y-h+bubSize/2));
		//console.log(sigmoidEnergy(this.energy));
		var s = sigmoidEnergy(this.energy);
		var vColor1 = createVector(255,0,0).mult(s);
		var vColor2 = createVector(127,64,64).mult(1-s);
		var vColor = vColor1.add(vColor2);
		vColor.x = floor(vColor.x);
		vColor.y = floor(vColor.y);
		vColor.z = floor(vColor.z);
		this.color = color(vColor.x,vColor.y,vColor.z);
		//console.log(vColor)
	}
	
	this.show = function () {
		fill(this.color);
		ellipse(this.pos.x, this.pos.y, bubSize, bubSize);	
	}
}

function sigmoidEnergy(x) {
	x = x/10;
	x = x- 2;
	return sigmoid(x);
}

function sigmoidViscosidad(x) {
	x = x - 3;
	return 1 - (0.01 * sigmoid(x));
}

function sigmoid(x) {
	return 1 / (1 + exp(-x));
}