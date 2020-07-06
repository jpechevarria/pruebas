function Source(x, y) {
  this.o = createVector(x,y);
  
  this.move = function (dx,dy) {
    this.o.x += dx;
    this.o.y += dy;
  }
  
  this.show = function () {
    fill(200);
    noStroke();
    ellipse(this.x,this.y,10);
  }
  
  this.drawRays = function() {
    stroke(255,128);
    
    var rays = 157 * 4;
    var step = 2 * 3.1416 / rays;
    for ( i = 0 ; i < rays ; i++ ) {
      a = i * step;
      //console.log ( i + ' - ' + a );
      var ray = p5.Vector.fromAngle(a);
      var finalHit = false;
      var minDist = Infinity;
      
      for ( j = 0 ; j < walls.length ; j ++ ) {
        var wall = walls[j];
        var hit = wall.hits(this.o, ray);
        if ( hit ) {
          // PARA VER TODOS LOS HITS
          //stroke(0,255,0,128);
          //line(hit.x-2,hit.y-2,hit.x+2,hit.y+2);
          //line(hit.x-2,hit.y+2,hit.x+2,hit.y-2);
          //ellipse(hit.x,hit.y,3);
          //line(this.o.x,this.o.y,hit.x,hit.y);
          //stroke(255,128);
          var wallDist = p5.Vector.sub(hit,this.o).mag();
          if ( wallDist < minDist )
          {
            minDist = wallDist;
            finalHit = hit;
          }

        }
      }
      var coefAlfa = 128;
      if ( finalHit )
      {
        var alfa = (1 - atan(minDist / coefAlfa)/(PI/2)) * 255
        stroke(255,alfa);
        //console.log(minDist);
        //ellipse(finalHit.x,finalHit.y,3);
      }
      else
      {
        minDist = 800
        var alfa = (1 - atan(minDist / coefAlfa)/(PI/2)) * 255
        stroke(255,alfa);
        finalHit = p5.Vector.add(this.o,p5.Vector.mult(ray,minDist));
      }
      
      // DIBUJA EL RAYO
      ///* V1
      if ( version == 1 ) {
        push();
        translate(this.o.x,this.o.y);
        rotate(a);
        line(0,0,minDist,0);
        pop();
      }
      //*/
      
      ///*V2
      if ( version == 2 ) {
        line(this.o.x,this.o.y,finalHit.x,finalHit.y);
      }
      //*/
    }
    
  }
  
}
