p5.disableFriendlyErrors = true;

w = 100;
h = 100;

grid = [];
next = [];

da = 1.0;
db = 0.5;
f = 0.055;
k = 0.062;

xoff = 4;
zoff = 0.025;

reaction = true;
blur = false;
mode = true;

function setup() {
  createCanvas(w,h);
  
  // CREA LA GRILLA
  grid.z = 0;
  next.z = 0;
  for ( var i = 0 ; i < w ; i++ ) {
    grid[i] = [];
    next[i] = []
    for ( var j = 0 ; j < h ; j++ ) {
      grid[i][j] = { a: 1, b: 0};
    }
  }
  
  // PONE ALGO DE B EN LA GRILLA
  for ( var x = 0 ; x < w ; x++ ) {
    for ( var y = 0 ; y < h ; y++ ) {
      v = noise(x/w*xoff,y/h*xoff, grid.z);
      //v= sigmoid(v);
      grid[x][y].a = v;
      grid[x][y].b = 0;
    }
  }

  // CLONA GRID EN NEXT
  for ( var i = 0 ; i < w ; i++ ) {
    next[i] = []
    for ( var j = 0 ; j < h ; j++ ) {
      next[i][j] = grid[i][j];
    }
  }

  currFrameRate = 0;
  dFC = createDiv();
}

function draw() {
  background(0);
  
  // REACTION - DIFUSSION
  if ( reaction ) {
    grid.z += zoff;
    next.z += zoff;
    for ( var y=0 ; y < h-1 ; y++ ) {
      for ( var x = int(w/4.0) ; x < (w-1)-int(w/4.0) ; x++ ) {
        v = noise(x/w*xoff,y/h*xoff, next.z);
        //v = sigmoid(v);
        //v = floor(v / 0.000001) * 0.000001;
        next[x][y].a = v;
        next[x][y].b = 0;
      }
    }
  }
  temp = grid;
  grid = next;
  next = temp;
  
  loadPixels();

  px = getPixelAccesor(0,0, pixels,w,h);
  
  // CALCULA EL HISTOGRAMA
  if ( ! mode )
  {
    var histo = [];
    var cats = 20;
    var cat_pixels = w / cats;
    var cat_rango = 1 / cats;
    for ( var i = 0 ; i < cats ; i++ ) {
      var desde = i * cat_rango;
      var hasta = (i+1) * cat_rango;
      var count = 0;
      for ( var y=0 ; y < h ; y++ ) {
        for ( var x = 0 ; x < w ; x++ ) {
          var a = grid[x][y].a;
          if ( a >= desde && a < hasta ) {
            count++;
          }
        }
      }
      histo[i] = count;
    }
    // DIBUJA
    var maxsize = w*h / 2 / (cats/20);
    for ( var i = 0 ; i < cats ; i++ )
    {
      var count = histo[i];
      var xd = i * cat_pixels;
      var xh = (i + 1 ) * cat_pixels;
      var yd = h;
      var yh = h - (count / maxsize) * h;
      for ( var x = xd ; x < xh ; x++ ) {
        for ( var y = yd ; y > yh ; y-- ) {
          px.setPos(x,y);
          px.setR(192);
          px.setG(192);
          px.setB(192);
        }
      }
    }
    
  }

  if ( mode ) {
    for ( var y=0 ; y < h ; y++ ) {
      for ( var x = 0 ; x < w ; x++ ) {
        a = grid[x][y].a;
        b = grid[x][y].b;
        
        px.setPos(x,y);
        colorFinal = createVector(0,0,0);

        // ESCALA DE GRISES
        //colorFinal = createVector(255,255,255);
        //colorFinal.mult(a);
        
        // ROJO VS AMARILLO
        ///*
        colorAlto = createVector(255,0,0);
        colorBajo = createVector(255,255,0);
        colorAlto.mult(a);
        colorBajo.mult(1-a);
        
        if ( a >= 0.3 && a < 0.5)
        {
          colorFinal = p5.Vector.add(colorAlto,colorBajo); 
        } else if ( a < 0.3 )
        {
          var coef = map(a,0.3, 0.0, 1.0, 0.0);
          colorFinal = p5.Vector.add(p5.Vector.mult(colorAlto,coef),colorBajo);
        } else if ( a >= 0.5 )
        {
          var coef = map(a,0.5, 1.0, 1.0, 0.0);
          colorFinal = p5.Vector.add(colorAlto,p5.Vector.mult(colorBajo,coef));
          
          if ( a >= 0.7)
          {
            coefRG = map(a,0.7,1.0,1.0,0.0);
            coefB = map(a,0.7,1.0,0.0,1.0);
            colorFinal.x *= coefRG;
            colorFinal.y *= coefRG;
            colorFinal.z = coefB*255;
          }
        }
        //*/
        
        // Afecta el color final
        if ( x <= w/2 )
        {
          var hVar = map(x,0,w/2,0,h);
        }
        else
        {
          var hVar = map(x,w/2,w,h,0);
        }
        hVar *= grid[x][0].a;
        
        if ( y <= (h-hVar) )
        {
          coef = map(y,0,(h-hVar),0,1);
          coef *= coef;
          coef *= coef;
          //coef *= coef;
          colorFinal.mult(coef);
        }
        else
        {
          coef = map(y,h-hVar,h,1,2);
          coef *= coef;
          colorFinal.mult(coef);
        }

        seno = sin(map(y,0,h*1.2,0,3.14));
        wVar = 0.3 * seno * (w/2);
        wVar += (grid[int(w/2.0)][y].a-0.5) * map(seno,0,1,0,20);
        xNorm = abs(x-w/2);
        if ( xNorm <= wVar ) {
          xCoef = map(xNorm, 0, wVar, 1, 0.5);
          xCoef *= xCoef;
        }
        else if ( xNorm <= wVar * 1.2){
          xCoef = map(xNorm, wVar, wVar * 1.2, 0.5, 0);
          xCoef *= xCoef;
        }
        else {
          xCoef = 0;
        }
        colorFinal.mult(xCoef);

        px.setR(colorFinal.x);
        px.setG(colorFinal.y);
        px.setB(colorFinal.z);
      }
    }
  }
  
  // BLUR  
  if ( blur )
  {
    pixelsAnt = []
    for ( var i=0 ; i < pixels.length ; i++ ) {
      pixelsAnt[i] = pixels[i];
    }
  
    pxAnt = getPixelAccesor(0,0, pixelsAnt,w,h);
    px = getPixelAccesor(0,0, pixels,w,h);
  
    for ( var y=1 ; y < h-1 ; y++ ) {
      for ( var x = 1 ; x < w-1 ; x++ ) {
        avgR = 0;
        avgG = 0;
        avgB = 0;
        for ( var dx = -1 ; dx <= +1 ; dx++ ) {
          for ( var dy = -1 ; dy <= +1 ; dy++ ) {
            pxAnt.setPos(x+dx,y+dy);
            avgR += pxAnt.getR() / 9;
            avgG += pxAnt.getG() / 9;
            avgB += pxAnt.getB() / 9;
          }
        }
        px.setPos(x,y);
        px.setR(avgR);
        px.setG(avgG);
        px.setB(avgB);
      }
    }
  }
  
  updatePixels();
  scale(2);
  
  if ( frameCount % 10 == 1 ) {
    currFrameRate = frameRate().toFixed(1);
  }
  var content = '';
  content += 'FC: ' + frameCount;
  content += '<br/>FrameRate: ' + currFrameRate;
  content += '<br/>' + 'gridSize: ' + grid.length;
  content += '<br/>' + 'reaction: ' + reaction;
  content += '<br/>' + 'blur: ' + blur;
  content += '<br/>' + 'mode: ' + mode;
  dFC.html(content);
}

function getPixelAccesor(x,y,pxs,w,h){
  var obj = {pixelList: pxs, w: w, h: h};
  
  obj.setPos = function (newx, newy) { 
    this.x = newx;
    this.y = newy;
    this.index = (this.y * this.w + this.x) * 4;
  };
  
  obj.setPos(x,y);
  
  obj.getR = function () { return this.pixelList[this.index]; }
  obj.setR = function ( v ) { this.pixelList[this.index] = v; }
  
  obj.getG = function () { return this.pixelList[this.index+1]; }
  obj.setG = function ( v ) { this.pixelList[this.index+1] = v; }

  obj.getB = function () { return this.pixelList[this.index+2]; }
  obj.setB = function ( v ) { this.pixelList[this.index+2] = v; }

  return obj;
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
  if (keyCode == 66) {
    blur = !blur;
  }
  if (keyCode == 72) {
    mode = !mode;
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
  
  if ( keyCode == 83 ) {
    maxa=0;
    mina=1;
    for ( var y=0 ; y < h ; y++ ) {
      for ( var x = 0 ; x < w ; x++ ) {
        a = grid[x][y].a;
        if ( a > maxa )
          maxa = grid[x][y].a;
        if ( a < mina ) {
          mina = a;
        }
      }
    }
    console.log('max a:', maxa, ' mina: ', mina);
  }
  console.log('keypresed' + keyCode);
}

function sigmoid(x) {
  //return x;
  return 1 / ( 1 + exp(-((x-0.5)*12)) );
}