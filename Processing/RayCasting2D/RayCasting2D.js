PI = 3.1415
cantWalls = 5;
walls = [];
t = 0;
toff = 0.001;

animate = false;
followMouse = false;
version = 1;

function setup() {
  createCanvas(800,600);
  center = createVector(width/2,height/2);
  source = new Source(center.x,center.y);
  
  ///*
  for ( i = 0 ; i < cantWalls ; i++ )
  {
    var margen = 10;
    var px = margen + random() * (width - 2*margen);
    var py = margen + random() * (height - 2*margen);
    var pa = random()*(2*PI);
    var pl = 100 + random() * 200;
    
    var px2 = px + cos(pa) * pl;
    var py2 = py + sin(pa) * pl;

    var px2 = margen + random() * (width - 2*margen);
    var py2 = margen + random() * (height - 2*margen);


    var wall = new Wall(new Point(px,py), new Point(px2,py2));
    
    walls.push(wall);
  }
  //*/
  
  /* PARA PROBAR
  var wall = new Wall(new Point(600,100), new Point(600,500));
  walls.push(wall);
  var wall = new Wall(new Point(200,100), new Point(600,100));
  walls.push(wall);
  cantWalls = walls.length;
  //*/

  divFC = createDiv('0');
}


function draw() {
  t = t + toff;
  background(0);
  stroke(255,0,0);
  strokeWeight(3);
  
  for ( i = 0 ; i < cantWalls ; i++ )
  {
    var wall = walls[i];
    wall.draw();
  }
 
  stroke(0);
  fill(0);
  strokeWeight(2);
  
  // mover el source
  if ( animate ) {
    // V1.0 - RANDOM
    var dl = 20 + random() * 80);
    var da = random()
    var dx = random()-0.5) * dl;
    var dy = (noise(toff, 1.0)-0.5) * dl;

    // V2.0 - NOISE
    var dl = 20 + (noise(toff, 2.0)-0.5) * 80;
    var dx = (noise(toff, 0.0)-0.5) * dl;
    var dy = (noise(toff, 1.0)-0.5) * dl;

    
    source.move(dx,dy);
    // V2.0 - UNSTABLE
    /*var vCenter = createVector(center.x - source.o.x, center.y - source.o.y);
    var dist = vCenter.mag();
    if ( dist < 5 ) { dist = 1; }
    if ( vCenter.mag() == 0 ) { vCenter.x += random(); vCenter.y += 1 - vCenter.x; } 
    vCenter.normalize();
    var dA = normRandom() / 4;
    vCenter.rotate(dA);
    var dL = 100 / dist * random();
    vCenter.mult(dL);
    
    source.move(vCenter.x, vCenter.y);
    */
  }
  
  source.show();
  source.drawRays();
  
  if ( frameCount % 10 == 0 ) {
    divFC.html(frameRate().toFixed(1));
  }
}

function keyPressed() {
  if ( keyCode == 80 ) {  // P
    if ( ! followMouse ) {
      animate = !animate;
    }
  }
  if ( keyCode == 86 ) {  // V
    version -= 1;
    version = (version + 1) % 2;
    version += 1
  }
}

function mouseClicked(){
  followMouse = ! followMouse;
  if ( followMouse ) {
    antSourcePos = createVector(source.o.x,source.o.y);
    antAnimate = animate;
    animate = false;
    source.o.x = mouseX;
    source.o.y = mouseY;
  }
  if ( ! followMouse )
  {
    //source.o = antSourcePos;
    animate = antAnimate;
    antSourcePos = null;
  }
}

function mouseMoved() {
  if ( followMouse ) {
    source.o.x = mouseX;
    source.o.y = mouseY;
  }
}

function normRandom() {
  // 6 TERMINOS
  var v = random()+random()+random()+random()+random()+random();
  return v - 3;
  // 12 TERMINOS
  //var v = random()+random()+random()+random()+random()+random()
  //      + random()+random()+random()+random()+random()+random();
  //return v - 6;
}
