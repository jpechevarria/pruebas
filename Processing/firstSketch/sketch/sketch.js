w = 400;
h = 400;

function setup() {
  createCanvas(400,400);
}

function draw() {
  background(0,0,0);
  loadPixels();
  
  for ( var j=0 ; j < h ; j++ ) {
    for ( var i = 0 ; i < w ; i++ ) {
      if ( random(1) > 0.25 )
      {
        var f = ((1/10.0)* j * 1.0) / TWO_PI; //sin(10*j);
        var c = (cos(f*i)); //* (cos(j)/2.0+1);
        var idx = (j * w + i) * 4;
        pixels[idx+0] = c*255; 
        pixels[idx+1] = c*255; 
        pixels[idx+2] = c*255; 
      }
    }
  }
  
  updatePixels();
}