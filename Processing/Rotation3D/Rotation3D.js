animate = false;

scaleX = 100;
scaleY = 100;

trackBallR = 100;

frameSample = 10;

initMouseX = 0;
initMouseY = 0;
initAxis = new Vertex(0,0,0);
finalAxis = new Vertex(0,0,0);
normAxis = new Vertex(0,0,0);
qTrackball = new Quaternion(0,1,0,0);
qTrackballAnt = new Quaternion(0,1,0,0);

function setup() {
  t = 0;
  createCanvas(400,400,WEBGL)
  dv2 = createDiv(); // MOUSE
  dv3 = createDiv(); // FRAMERATE
  dv4 = createDiv(); // TRACKBALL
  dv = createDiv(); // CUENTAS
}

function drawAxis() {
  stroke(0);
  fill(0);
  
  beginShape(LINES);

  // EJES
  vertex(-width/2,0,0,0,0);
  vertex(width/2,0,0,0,0);
  vertex(0,-height/2,0,0,0);
  vertex(0,height/2,0,0,0);
  
  // Marcadores en X
  var hMarker = scaleX / 10;
  for ( i = scaleX ; i < width/2 ; i += scaleX ) {
    vertex( i,-hMarker, 0, 0, 0);
    vertex( i, hMarker, 0, 0, 0);
    vertex(-i,-hMarker, 0, 0, 0);
    vertex(-i, hMarker, 0, 0, 0);
  }

  // Marcadores en Y
  for ( i = scaleY ; i < height/2 ; i += scaleY ) {
    vertex(-hMarker, i, 0, 0, 0);
    vertex( hMarker, i, 0, 0, 0);
    vertex(-hMarker,-i, 0, 0, 0);
    vertex( hMarker,-i, 0, 0, 0);
  }
  endShape();
}

function draw() {
  if ( animate ) {
    t += 0.1;
  }
  mainDraw2();
  showFrameRate();

}

function showFrameRate() {
  if ( frameCount % frameSample == 0 )
  {
    //console.log('.');
    dv3.html(round(frameRate(),2) );
    
    // AUTO - FRAME SAMPLE PERIOD
    /*
    frameSample = round(frameRate()/4);
    if ( frameSample < 5 )
    {
      frameSample = 5;
    }
    */
  }
}

function mainDraw2() {
  background(128);  
  stroke(0);

  var a = new Vertex( 0 , 0 , 0 );
  var b = new Vertex( 1 , 0 , 0 );
  var c = new Vertex( 1 , 1 , 0 );
  var d = new Vertex( 0 , 1 , 0 );
  
  var e = new Vertex( 0 , 0 , 1 );
  var f = new Vertex( 1 , 0 , 1 );
  var g = new Vertex( 1 , 1 , 1 );
  var h = new Vertex( 0 , 1 , 1 );
  
  allVertex = [ a, b, c, d, e, f, g, h ];
  
  // TRASLATION TO CENTER
  allVertex.forEach(function(v) { v.translate(-0.5,-0.5,-0.5) }); 

  // ROTACION DEL MODELO
  var axis = new Vertex(0,0,1);
  var origRot = t * 0.5; //0;//
  var qr = Quaternion.fromAxisAngle(axis, origRot);
  
  ///* ACUMULA ROTACION DE MUNDO - segun trackball 
  var qr2 = qTrackball;
  qr = Quaternion.fromMatrix(qr2.getMatrix().mult(qr.getMatrix()));  
  //*/

  var qrc = qr.conjugate();
  var mqr = qr.getMatrix();
  var mqrc = qrc.getMatrix();
  
  ///*
  allVertex.forEach(
    function(v) {
      var qv = Quaternion.fromV3(v);
      var mqv = qv.getMatrix();
      var tmp = mqr.mult(mqv);
      tmp = tmp.mult(mqrc);
      tmp = Quaternion.fromMatrix(tmp);
      v.x = tmp.x;
      v.y = tmp.y;
      v.z = tmp.z;
    }
  );
  //*/
  
  noFill();

  push();
  translate(0,0,0);
  scale(scaleX,scaleX,-scaleX);
  drawCube(a,b,c,d,e,f,g,h);
  pop();

  /*
  push();
  translate(200,0,0);
  scale(scaleX,scaleX,-scaleX);
  drawCube(a,b,c,d,e,f,g,h);
  pop();

  push();
  translate(-200,0,0);
  scale(scaleX,scaleX,-scaleX);
  drawCube(a,b,c,d,e,f,g,h);
  pop();
  //*/

}

function drawCube(a,b,c,d,e,f,g,h) {
  
  var shape = TRIANGLES;
  
  beginShape(shape);

  fill(255,0,0);
  drawQuad(a,b,c,d);
  
  fill(0,255,0);
  drawQuad(e,f,g,h);

  fill(0,0,255);
  drawQuad(a,b,f,e);

  fill(255,255,0);
  drawQuad(d,c,g,h);

  fill(255,0,255);
  drawQuad(b,f,g,c);

  fill(0,255,255);
  drawQuad(a,d,h,e);
  
  endShape();
}

function drawQuad(a,b,c,d) {
  
  // TRIANGLES
  vertex(a.x,a.y,a.z, 0, 0);
  vertex(b.x,b.y,b.z, 0, 0);
  vertex(c.x,c.y,c.z, 0, 0);

  vertex(a.x,a.y,a.z, 0, 0);
  vertex(c.x,c.y,c.z, 0, 0);
  vertex(d.x,d.y,d.z, 0, 0);

}

function mousePressed() {
  dv2.html('mouse = ( ' + (mouseX - width/2) + ' , ' + (mouseY - height/2) + ' )');
  var texto = '';
  
  initMouseX = mouseX;
  initMouseY = mouseY;
  
  initMouseX -= width/2;
  initMouseY -= height/2;
  
  initAxis = new Vertex(initMouseX,initMouseY,0);
  var l = initAxis.len(); 
  if ( l > trackBallR )
  {
    var ratio = (trackBallR - 0.00001) / l;
    initAxis.scale(ratio,ratio,ratio);
    texto += 'scaledRatio= ' + ratio + '<br>';
  }
  initAxis.z = -sqrt(trackBallR*trackBallR - initAxis.x*initAxis.x - initAxis.y*initAxis.y);
  //initAxis = initAxis.normalize();

  texto += 'initMouseX= ' + initMouseX + ' - initMouseY= ' + initMouseY + '<br>';
  texto += 'initAxis= ' + initAxis.redondear() + '<br>';
  texto += 'lenAxis= ' + initAxis.len() + '<br>';
  texto += 'lenXY= ' + sqrt(initAxis.x*initAxis.x + initAxis.y*initAxis.y) + '<br>';
  dv.html(texto);
  
}

function mouseReleased() {
  qTrackballAnt = qTrackball;
}

function mouseDragged() {
  //console.log('mouseDragged');
  dv2.html('mouse = ( ' + (mouseX - width/2) + ' , ' + (mouseY - height/2) + ' )');
  
  var finalMouseX = mouseX - width/2;
  var finalMouseY = mouseY - height/2;
  
  finalAxis = new Vertex(finalMouseX,finalMouseY,0);
  var l = finalAxis.len(); 
  if ( l > trackBallR )
  {
    var ratio = (trackBallR - 0.00001) / l;
    finalAxis.scale(ratio,ratio,ratio);
    texto += 'scaledRatio= ' + ratio + '<br>';
  }
  finalAxis.z = -sqrt(trackBallR*trackBallR - finalAxis.x*finalAxis.x - finalAxis.y*finalAxis.y);
  
  var texto = '' 
  texto += 'initMouseX= ' + initMouseX + ' - initMouseY= ' + initMouseY + '<br>';
  texto += 'finalMouseX= ' + finalMouseX + ' - finalMouseY= ' + finalMouseY + '<br>';
  texto += '--------------------------------------<br>';
  
  texto += 'initAxis= ' + initAxis.redondear() + '<br>';
  //texto += 'lenInitAxis= ' + initAxis.len() + '<br>';
  
  texto += 'finalAxis= ' + finalAxis.redondear() + '<br>';
  //texto += 'lenFinalAxis= ' + finalAxis.len() + '<br>';
  
  normAxis = initAxis.cross(finalAxis);
  
  texto += 'normAxis= ' + normAxis.redondear() + '<br>';
  //texto += 'lenNormAxis= ' + normAxis.len() + '<br>';
  
  var rotAxis = normAxis.normalize();
  var rotAngle = acos(finalAxis.dot(initAxis)/initAxis.len()/finalAxis.len());

  var qRot = Quaternion.fromAxisAngle(rotAxis, rotAngle );

  texto += 'rotAngle= ' + rotAngle + '<br>';
  texto += 'rotAxis= ' + rotAxis.redondear() + '<br>';
  texto += '--------------------------------------<br>';

  var mqr = qRot.getMatrix();
  
  var mqt = qTrackballAnt.getMatrix();
  
  var mf = mqr.mult(mqt);
  var newQTrackball = Quaternion.fromMatrix(mf);
  if ( ! isNaN(newQTrackball.x) ) {
    qTrackball = newQTrackball;
  }
  dv4.html('qTrackball: ' + qTrackball.redondear());
  
  dv.html(texto);
  
  //if ( rotAngle > 0.5 ) {
    initAxis = finalAxis;
    qTrackballAnt = qTrackball;
  //}
}

function mouseMoved() {
  dv2.html('mouse = ( ' + (mouseX - width/2) + ' , ' + (mouseY - height/2) + ' )');
}

function keyPressed() {
  console.log(keyCode);
  if ( keyCode == 83 ) {
    animate = !animate;
  }
  else if ( keyCode == 82 ) {
    t = 0;
    qTrackball = new Quaternion(0,1,0,0);
    qTrackballAnt = new Quaternion(0,1,0,0);
    dv4.html('qTrackball: ' + qTrackball.redondear());
  }

}
