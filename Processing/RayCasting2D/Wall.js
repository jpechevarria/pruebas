function Wall(p1,p2) {
  this.ini = p1;
  this.fin = p2;
  this.largo = this.ini.distancia(this.fin); 
  
  this.draw = function () {
    line(this.ini.x,this.ini.y, this.fin.x, this.fin.y);
  }
  
  this.hits = function(o, p) {
    var ray = p.copy();
    ray.normalize();
    var wall = createVectorFromPoints(this.ini,this.fin);
    wall.normalize();
    var c1 = this.ini.x - o.x;
    var c2 = this.ini.y - o.y;
    
    var detS = ray.x * (-wall.y) - ray.y * (-wall.x);
   
    var detU = c1 * (-wall.y) - c2 * (-wall.x);
   
    var detT = ray.x * c2 - (ray.y) * c1;
   
    if ( detS != 0 ) {
      var U = detU / detS;
      var T = detT / detS;
      if ( U >= 0 ) {
        if ( 0 <= T && T <= this.largo )
        {
          return p5.Vector.add(o, p5.Vector.mult(ray,U)); 
        }
      }
    }
  }
  
  this.distancia = function(p) {
    var vw = createVectorFromPoints(this.ini,this.fin);
    var vp = createVectorFromPoints(this.ini,p);
    var proy = vp.dot(vw) / this.largo;
    
    if ( proy >= 0 ) {
      if ( proy <= this.largo ) {
        return sqrt(vp.largo * vp.largo - proy * proy);
      }
      else {
        return this.fin.distancia(p);
      }
    }
    else {
      return this.ini.distancia(p);
    }
    
  }
  
}
