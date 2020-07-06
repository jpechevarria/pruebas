function setup() {
  createCanvas(600,600);
  msg = createDiv();
  
  sld = createSlider(0,360,45);
  sld2 = createSlider(10,300,50);
}

function draw() {
  background(127,127,255);
  
  // DIBUJA UN VECTOR HACIA EL MOUSE
  var mX = mouseX - width/2;
  var mY = -(mouseY - height/2);
  
  translate(width/2, height/2);
  scale(1,-1);
  strokeWeight(5);
  stroke(0);
  point(0,0);
  point(mX, mY);

  stroke(0,0,0);
  drawVector(0,0,+width/2,0);
  drawVector(0,0,-width/2,0);
  drawVector(0,0,0,+height/2);
  drawVector(0,0,0,-height/2);
  
  stroke(0,255,0);
  drawVector(0,0,mX,mY);
  
  // DIBUJA EL VECTOR MOVIL CON EL SLIDER
  var vIni = createVector(sld2.value(),0);
  var matRot = [];
  var teta = radians(sld.value());

  var x2 = vIni.x * cos(teta) - vIni.y * sin(teta);
  var y2 = vIni.x * sin(teta) + vIni.y * cos(teta);
  
  stroke(200,50,50);
  drawVector(0,0,x2,y2);
  
  var mA = degrees(atan2(mY,mX));
  msg.html('MouseAngle= ' + mA + '<br>');
  msg.html(msg.html() + 'sld= ' + sld.value() + '<br>');


}

drawVector = function () {
  if ( arguments.length == 2 )
  {
    origen = arguments[0]; 
    destino = arguments[1];
  }
  else if ( arguments.length == 4 )
  {
    origen  = createVector(arguments[0],arguments[1]);
    destino = createVector(arguments[2],arguments[3]);
  }
  push();
  var vecN = p5.Vector.sub(destino,origen);
  var m = vecN.mag();
  var a = atan2(vecN.y,vecN.x);
  translate(origen.x,origen.y);
  rotate(a);
  scale(m,m);
  
  strokeWeight(2/m);
  line(0,0,1,0);
  deltaPunta = 5 / m;
  line(1,0,1-deltaPunta,+deltaPunta);
  line(1,0,1-deltaPunta,-deltaPunta);

  pop();
};