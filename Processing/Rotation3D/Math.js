
function Quaternion(t,x,y,z) {
  this.t = t;
  this.x = x;
  this.y = y;
  this.z = z;

  this.toString = function () {
    return 'quaternion ( ' + this.t + ' , ' + this.x + ' , ' + this.y + ' , ' + this.z + ' )';
  }
  
  this.conjugate = function (){
    return new Quaternion(this.t, -this.x, -this.y, -this.z);
  }
  
  this.len = function() {
    return sqrt(this.t * this.t + this.x * this.x + this.y * this.y + this.z * this.z);
  }

  this.normalize = function () {
    l = this.len();
    return new Quaternion(this.t/l, this.x/l, this.y/l, this.z/l);
  }

  this.getMatrix = function () {
    var a = new Complex(t,x);
    var b = new Complex(y,z);
    var c = b.conjugate().multScalar(-1);
    var d = a.conjugate();
    return new CMatrix2(a,b,c,d);
  }
  
  this.mult = function (q) {
    var m = this.getMatrix();
    var mq = q.getMatrix();
    
    return Quaternion.fromMatrix(m.mult(mq));
  }
  
  this.redondear = function () {
    var prec=1000;
    var nT = round(this.t * prec) / prec;
    var nX = round(this.x * prec) / prec;
    var nY = round(this.y * prec) / prec;
    var nZ = round(this.z * prec) / prec;
    
    return new Quaternion(nT,nX,nY,nZ);
  }
  
}

Quaternion.fromV3 = function(v) {
  return new Quaternion(0,v.x,v.y,v.z);
}

Quaternion.fromMatrix = function(cm) {
  var a = cm.data[0][0];
  var b = cm.data[0][1];
  return new Quaternion(a.real(),a.imag(),b.real(),b.imag());
}

Quaternion.fromAxisAngle = function(axis, angle) {
  var qAngle = angle/2;
  var v = axis.normalize();
  v = v.multScalar(sin(qAngle));
  var t = cos(qAngle);
  return new Quaternion(t, v.x, v.y, v.z);
}

function CMatrix2 (a, b, c, d) {
  this.data = [ [a, b] , [c, d] ];
  
  this.mult = function (m) {
    var result = new CMatrix2(0,0,0,0);
    
    result.data[0][0] = this.data[0][0].mult(m.data[0][0]).add(this.data[0][1].mult(m.data[1][0]));
    result.data[0][1] = this.data[0][0].mult(m.data[0][1]).add(this.data[0][1].mult(m.data[1][1]));

    result.data[1][0] = this.data[1][0].mult(m.data[0][0]).add(this.data[1][1].mult(m.data[1][0]));
    result.data[1][1] = this.data[1][0].mult(m.data[0][1]).add(this.data[1][1].mult(m.data[1][1]));

    return result;
  }
  
  this.toString = function() {
    return '[ [ ' + this.data[0][0] + ' , ' + this.data[0][1] + ' ] , [ ' + this.data[1][0] + ' , ' + this.data[1][1] + ' ] ] '; 
  }
}

function Complex(a, b) {
  this.a = a;
  if ( typeof b !== "undefined" )
    this.b = b; 
   else 
     this.b = 0;
  
  this.real = function() { return this.a; }
  this.imag = function() { return this.b; }
  
  this.add = function (c) {
    return new Complex(this.a + c.a, this.b + c.b);
  }
  
  this.multScalar = function (s) {
    return new Complex(this.a * s, this.b * s);
  }
  
  this.mult = function (c) {
    newA = this.a * c.a - this.b * c.b;
    newB = this.a * c.b + this.b * c.a;
    //console.log('this.a = ' + this.a + ' this.b = ' + this.b + ' c.a = ' + c.a + ' c.b = ' + c.b + ' ; newB = ' + newB);
    return new Complex(newA, newB);
  }
  
  this.toString = function () {
    var ret = this.a
    if ( this.b < 0 ) 
      ret += ' - ' + abs(this.b) + ' i';
    else
      ret += ' + ' + this.b + ' i';
      
    return ret;
  }
  
  this.len = function() {
    return sqrt(this.a*this.a + this.b * this.b);
  }
  
  this.normalize = function () {
    l = this.len();
    return new Complex(this.a/l, this.b/l);
  }
  
  this.conjugate = function (){
    return new Complex(this.a, -this.b);
  }
}
