animar = true;
baseAng = 0;
step = 0.05;
mute = false;
filterFrec = 22050;
filterRes  = 15;

function preload() {  // preload() runs once
  soundFormats('mp3','ogg');
  sound = loadSound('files/tema.mp3');
}

function setup() {
  createCanvas(800,600);
  //mic = new p5.AudioIn();
  //mic.start();
  fft = new p5.FFT();
  //mic.connect(fft);
  sound.loop();
  sound.disconnect();
  //fft.disconnect();
  //sound.disconnect();
  filter = new p5.LowPass();
  filter.set(filterFrec, filterRes);
  sound.connect(filter);
  filter.disconnect();
  filter.connect(fft);
  //filter.connect();

  prevMouseX = width;
  prevMouseY = height;

}

function draw() {
    
  if ( ! animar ) return;
  background(255);

  stroke(255,0,0);
  strokeWeight(1);
  line(0,prevMouseY,width,prevMouseY);
  line(prevMouseX,0,prevMouseX,height);

  
  //stroke(0);
  //noFill();
  //rect(0,0,399,399);
  stroke(0);
  strokeWeight(4);
  fill(0);

  //var level = mic.getLevel();
  
  // CUADRADOS
  /*
  var size = map(level, 0, 1, 0, 1000);
  var w = 40;
  rect((width-w)/2,(height-size)/2, w, size );
  if ( level > 0.1 )
  {
    size *= 0.5;
    rect((width-w)/2-w,(height-size)/2, w, size );
    rect((width-w)/2+w,(height-size)/2, w, size );
    if ( level > 0.15 )
    {
      size *= 0.5;
      rect((width-w)/2-w-w,(height-size)/2, w, size );
      rect((width-w)/2+w+w,(height-size)/2, w, size );
    }
  }
  //*/ 
  
  /* PIXELS
  var size = map(level, 0, 1, 0, 1000);
  line(200,200,200,200-size);
  
  loadPixels();
  for ( y = 1 ; y < height - 1 ; y ++ )
  {
    for ( x = 1 ; x < width - 1 ; x ++ )
    {
      var pos = (y * width + x) * 4;
      var posSig = (y * width + x + 1) * 4;
      
      pixels[pos+0] = pixels[posSig+0];
      pixels[pos+1] = pixels[posSig+1];
      pixels[pos+2] = pixels[posSig+2];
      pixels[pos+3] = pixels[posSig+3];
    }
  }
  updatePixels();
  */
  
  var spectrum = fft.analyze();
  
  for ( var i = 0 ; i < spectrum.length ; i++ )
  {
    var amp = spectrum[i];
    var x = map(i, 0, spectrum.length, 0, width);
    var y = map(amp, 0, 255, 0, height);
    var ang = map(x,0,width,0,4*PI);
    
    var red = map(amp,0,255,20,128);
    
    push();
    stroke(red,200-red,20,127);
    ///* de abajo hacia arriba
    translate(0,height);
    scale(1,-1);
    line(x,0,x,y);
    //*/
    /* CIRCULAR
    translate(width/2,height/2);
    rotate(baseAng+ang);
    scale(1,1);
    var circ = 100;
    var scaleOut = 0.5, scaleIn = 0.1;
    // LINEA HACIA AFUERA
    line(0,circ,0,circ+y*scaleOut);
    // LINEA HACIA ADENTRO
    line(0,circ,0,circ-y*scaleIn);
    //*/
    pop();
  }
  baseAng+=step;
}

function mouseClicked() {
  filterFreq = map (mouseX, 0, width, 10, 22050);
  filterRes = map(mouseY, 0, height, 15, 5);
  filter.set(filterFreq,filterRes);
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function keyPressed(){
  if ( keyCode == 83 ) {
    mute = !mute;
    if ( mute ) {
      //sound.setVolume(0, 1);
      sound.disconnect();
      filter.disconnect();
      sound.connect(filter);
      filter.connect(fft);
    }
    else {
      //sound.setVolume(1.0, 1);
      sound.disconnect();
      filter.disconnect();
      sound.connect(filter);
      filter.connect(fft);
      filter.connect();
    }
    if ( keyCode == 65 ) {
      animar = ! animar;
    }
  }
  console.log('keypresed ' + keyCode);
  console.log('mute ' + mute);
}