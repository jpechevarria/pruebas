w = 200;
h = 200;

grid = [];
next = [];

da = 1.0;
db = 0.5;
f = 0.055;
k = 0.062;

reaction = false;

function setup() {
  createCanvas(w,h);
  
  // CREA LA GRILLA
  for ( var i = 0 ; i < w ; i++ ) {
    grid[i] = [];
    next[i] = []
    for ( var j = 0 ; j < h ; j++ ) {
      grid[i][j] = { a: 1, b: 0};
    }
  }
  
  // PONE ALGO DE B EN LA GRILLA
  c1 = createVector(w/3,h/3);
  c2 = createVector(w*2/3,h*2/3);
  for ( var x = 0 ; x < w ; x++ ) {
    for ( var y = 0 ; y < h ; y++ ) {
      // v1
      /*if ( x >= w/2-20 && x < w/2+20 && y >= h/2-20 && y < h/2+20)
      {
        grid[x][y].b = 1;
      }*/
      // V2
      /*
      d1 = dist(x,y,c1.x,c1.y);
      if ( d1 < 50 ) {
        grid[x][y].b = 1-(d1/50.0);
        grid[x][y].a = (d1/50.0);
      }
      d2 = dist(x,y,c2.x,c2.y);
      if ( d2 < 50 ) {
        grid[x][y].b = 1-(d2/50.0);
        grid[x][y].a = (d2/50.0);
      } 
      //*/
      // V3
      /*if ( (floor(x / 25.0) + floor(y / 25.0)) % 2 == 0 )
      {
        grid[x][y].b = 1;
        grid[x][y].a = 0;
      }*/
      // V4
      ///*
      v = noise(x/w*4,y/h*4);
      v=v*v;
      v = floor(v / 0.1) * 0.1;
      /*
      if ( v <= 0.45 ) {
        v = 0;
      } else if ( v > 0.55 ) {
        v = 1;
      }
      */
      grid[x][y].b = v;
      grid[x][y].a = 1-v;
      //*/
    }
  }

  // CLONA GRID EN NEXT
  for ( var i = 0 ; i < w ; i++ ) {
    next[i] = []
    for ( var j = 0 ; j < h ; j++ ) {
      next[i][j] = grid[i][j];
    }
  }

  
  dFC = createDiv();
}

function draw() {
  background(0);
  
  // REACTION - DIFUSSION
  if ( reaction ) {
    for ( var y=1 ; y < h-1 ; y++ ) {
      for ( var x = 1 ; x < w-1 ; x++ ) {
        a=grid[x][y].a;
        b=grid[x][y].b;
        
        next[x][y].a = a + ( da * LA(x,y) - a * b * b + f * (1 - a) );
        next[x][y].b = b + ( db * LB(x,y) + a * b * b - (k + f) * b );
      }
    }
  }
  temp = grid;
  grid = next;
  next = temp;
  
  loadPixels();

  for ( var y=0 ; y < h ; y++ ) {
    for ( var x = 0 ; x < w ; x++ ) {
      a = grid[x][y].a;
      b = grid[x][y].b;
      pIndex = (y * w + x) * 4;
      ca=a*255;
      cb=b*255;
      pixels[pIndex] = ca;
      pixels[pIndex+1] = ca;
      pixels[pIndex+2] = ca;
    }
  }
  updatePixels();
  scale(2);

  dFC.html('FC: ' + frameCount);
  dFC.html(dFC.html() + '<br>' + 'gridSize: ' + grid.length);
  dFC.html(dFC.html() + '<br>' + 'reaction: ' + reaction);
}

function LA(x,y){
  sum = 0;
  sum += grid[x][y].a * -1;
  //adyacentes
  sum += grid[x-1][y].a * 0.2;
  sum += grid[x+1][y].a * 0.2;
  sum += grid[x][y-1].a * 0.2;
  sum += grid[x][y+1].a * 0.2;
  //diagonales
  sum += grid[x-1][y-1].a * 0.05;
  sum += grid[x-1][y+1].a * 0.05;
  sum += grid[x+1][y-1].a * 0.05;
  sum += grid[x+1][y+1].a * 0.05;
  return sum;
}

function LB(x,y){
  sum = 0;
  sum += grid[x][y].b * -1;
  //adyacentes
  sum += grid[x-1][y].b * 0.2;
  sum += grid[x+1][y].b * 0.2;
  sum += grid[x][y-1].b * 0.2;
  sum += grid[x][y+1].b * 0.2;
  //diagonales
  sum += grid[x-1][y-1].b * 0.05;
  sum += grid[x-1][y+1].b * 0.05;
  sum += grid[x+1][y-1].b * 0.05;
  sum += grid[x+1][y+1].b * 0.05;
  return sum;
}

function keyPressed() {
  if (keyCode == 32) {
    reaction = !reaction;
  }
  
  if (keyCode == 68 ){
     x = floor(random(w));
     y = floor(random(h));
     a = 0;
     b = 1;
     r = 10;    
     for ( var dx = -r ; dx <= r ; dx++) {
       for ( var dy = -r ; dy <= r ; dy++) {
         grid[x+dx][y+dy].a= a;
         grid[x+dx][y+dy].b= b;
       }
     }
  }
  console.log('keypresed' + keyCode);
}