function Point(x,y) {
  this.x = x;
  this.y = y;
  
  this.distancia = function(p) {
    var v = createVectorFromPoints(this,p);
    return v.mag();
  }
  
}

createVectorFromPoints = function (p1,p2) {
  return createVector(p2.x-p1.x,p2.y-p1.y);
}
