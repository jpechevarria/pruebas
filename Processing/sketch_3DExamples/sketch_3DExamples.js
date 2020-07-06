function setup() {
  createCanvas(800,600, WEBGL);
  var fov = 60 / 180 * PI;
  var cameraZ = height / 2.0 / tan(fov / 2.0);
  perspective(60 / 180 * PI, width / height, cameraZ * 0.1, cameraZ * 10);
  frameCountIni = frameCount;
}

function draw() {
  background(200);
  orbitControl();
  noFill();
  stroke(255, 0, 0);
  push();
  rotateX(frameCount * 0.03);
  translate(sin(frameCount*0.05)*100,100,0);
  //push();
  box(50,50,50);
  pop();
  
  /*
  push();
  translate(100,0,0);
  rotateY(frameCount * 0.01);
  box(50,50,50);
  pop();
  */
  /*
  sphere(40);
  
  translate(50,50);
  sphere(40);
  */
}