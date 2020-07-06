function Vertex(x,y,z) {
  this.x = x;
  this.y = y;
  this.z = z;
  
  this.toString = function () {
    return 'vertex ( ' + this.x + ' , ' + this.y + ' , ' + this.z + ' )';
  }
  
  this.len = function() {
    return sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  this.normalize = function () {
    l = this.len();
    return new Vertex(this.x/l, this.y/l, this.z/l);
  }
  
  this.add = function(v) {
    return new Vertex(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  this.sub = function(v) {
    return new Vertex(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  this.multScalar = function (s) {
    return new Vertex(this.x * s, this.y * s, this.z * s);
  }
  
  this.scale = function(sx,sy,sz) {
    this.x *= sx;
    this.y *= sy;
    this.z *= sz;
  }
  
  this.translate = function(tx,ty,tz) {
    this.x += tx;
    this.y += ty;
    this.z += tz;
  }
  
  this.dot = function(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z ; 
  }
  
  this.cross = function(v) {
    /*
    s1 = u2 v3 - u3 v2
    s2 = u3 v1 - u1 v3
    s3 = u1 v2 - u2 v1
    */
    var u1 = this.x, u2 = this.y, u3 = this.z;
    var v1 = v.x   , v2 = v.y   , v3 = v.z   ;
    var s1 = u2 * v3 - u3 * v2;
    var s2 = u3 * v1 - u1 * v3;
    var s3 = u1 * v2 - u2 * v1;
    
    return new Vertex(s1,s2,s3);
  }
  
  this.redondear = function () {
    var prec=1;
    var nX = round(this.x * prec) / prec;
    var nY = round(this.y * prec) / prec;
    var nZ = round(this.z * prec) / prec;
    
    return new Vertex(nX,nY,nZ);
  }
}
