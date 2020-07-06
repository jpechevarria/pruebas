function setup() {
  createCanvas(640, 480);
  capture = createCapture(VIDEO);
  //capture.hide();
  
  div = createDiv();
  sld = createSlider(2,255,2);
  //frameRate(10);

  vBase = createVector(127,127,127);
  vCenter = createVector(127,127,127);
  
  vBlack = createVector(0,0,0);
  vWhite = createVector(255,255,255);
  
  vRed = createVector(255,0,0);
  vGreen = createVector(0,255,0);
  vBlue = createVector(0,0,255);
  
  maxColorDist = vBlack.dist(vWhite);
}

function draw() {
  background(0);
  
  image(capture, 0, 0, width, width*capture.height/capture.width);
  loadPixels();
  //filter(INVERT);
  //filter(THRESHOLD, 0.6);
  //filter(POSTERIZE,sld.value());
  //filter(GRAY);
  //filter(BLUR,3);
  //filter(ERODE);
  //filter(DILATE);
  
  pixels[4000] = 255;
  pixels[4000+4] = 255;
  pixels[4000+8] = 255;
  var localC;

  for ( var y = 0 ; y < 480 ; y++ ){
    var base = y * 640;
    for ( var x = 0 ; x < 640 ; x++ ){
      var index = (base + x) * 4;
      var cR = pixels[index];
      var cG = pixels[index+1];
      var cB = pixels[index+2];

      //var c = color(cR, cG, cB);
      //var h = hue(c);
      //var s = saturation(c);
      //var l = lightness(c);

      var vColor = createVector(cR, cG, cB);
      var distBase = vBase.dist(vColor);
      var distCenter = vCenter.dist(vColor);
      var distRed = vRed.dist(vColor) * 1.0;
      var distGreen = vGreen.dist(vColor) * 1.0;
      var distBlue = vBlue.dist(vColor) * 1.0;
      
      
      /* V1
      if ( distCenter > 150 )
      {
        var ncR = map(distRed, 0,maxColorDist,0,255);
        var ncG = map(distGreen, 0,maxColorDist,0,255);
        var ncB = map(distBlue, 0,maxColorDist,0,255);
      }
      else {
        var ncR = cR;
        var ncG = cG;
        var ncB = cB;
      }
      */ 
      
      // V2
      var ncR = map(distCenter,0,maxColorDist,0,255);
      var ncG = ncR;
      var ncB = ncR;
      
      //cv = 255-cv;

      pixels[index] = ncR;
      pixels[index+1] = ncG;
      pixels[index+2] = ncB;
      if ( x == 50 && y == 50 )
      {
        localC = '';
        localC += 'maxColorDist --> ' + maxColorDist + '<br/>';
        localC += 'dist --> (r: ' + distRed  + ',' + 'g: ' + distGreen  + ',' + 'b: ' + distBlue  + ') <br/>';
        localC += 'orig --> (r: ' + cR  + ',' + 'g: ' + cG  + ',' + 'b: ' + cB  + ') <br/>';
        localC += 'new  --> (r: ' + ncR + ',' + 'g: ' + ncG + ',' + 'b: ' + ncB + ') <br/>';
      }
    }
  }

  updatePixels();
  strokeWeight(2);
  stroke(255,0,0);
  noFill();
  rect(50,50,10,10);
  
  div.html('');
  div.html('localC: ' + localC );
  div.html(div.html() + '<br/>FrameCount: ' + frameCount);
}