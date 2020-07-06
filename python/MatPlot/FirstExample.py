import matplotlib as mpl
from mpl_toolkits.mplot3d import Axes3D
import numpy as np
import matplotlib.pyplot as plt
import math

class Vec3:
    x = 0
    y = 0
    z = 0
    def __init__(self,x,y,z):
        self.x = x
        self.y = y
        self.z = z
        
    def __init__(self,arr):
        self.x = arr[0]
        self.y = arr[1]
        self.z = arr[2]

    def length(self):
        return math.sqrt(self.x*self.x + self.y*self.y + self.z*self.z)

class Quaternion:
    t = 0
    i = 0
    j = 0
    k = 0
    def __init__(self):
        pass

    def __init__(self, a ,b , c, d):
        self.t = a;
        self.i = b;
        self.j = c;
        self.k = d;
        
    def __repr__(self):
        return '[{}, [{},{},{}] ]'.format(self.t,self.i,self.j, self.k)

    def getMatrix(self):
        p1 = self.t + self.i * 1j
        p2 = self.j + self.k * 1j
        p3 = -p2.conjugate()
        p4 = p1.conjugate()
        return np.array([ [p1, p2] , [p3, p4] ])

    def length(self):
        return math.sqrt(self.t*self.t + self.i*self.i + self.j*self.j + self.k*self.k)

    def conjugate(self):
        return Quaternion(self.t,-self.i,-self.j,-self.k)

    def asNpArr(self):
        return np.array([ self.t, self.i, self.j, self.k ]);

def getQuatFromVec3(v):
    return Quaternion(0, v[0],v[1],v[2])

def getVec3FromQuat(q):
    return np.array([q.i,q.j,q.k]);

def getQuatFromMatrix(m):
    return Quaternion(m[0,0].real, m[0,0].imag, m[0,1].real, m[0,1].imag )

def rotateByQ(v, q):
    qc=q.conjugate()
    qv = getQuatFromVec3(v)
    Mv = qv.getMatrix()
    Mq = q.getMatrix()
    Mqc = qc.getMatrix()
    Mqv = np.matmul(Mq,Mv)
    Mqvqc = np.matmul(Mqv,Mqc)
    qvr = getQuatFromMatrix(Mqvqc)
    return getVec3FromQuat(qvr)


mpl.rcParams['legend.fontsize'] = 10

fig = plt.figure()
ax = fig.gca(projection='3d')

ax.set_xlim([-2,2])
ax.set_ylim([-2,2])
ax.set_zlim([-2,2])

theta = np.linspace(-4 * np.pi, 4 * np.pi, 100)
z = np.linspace(-2, 2, 100)
r = z**2 + 1
x = r * np.sin(theta)
y = r * np.cos(theta)

# JPE
o = np.array([0,0,0])
x = np.array([1,0,0])
y = np.array([0,1,0])
z = np.array([0,0,1])


a = o
b = o + x
c = o + x + y
d = o + y

e=a+z
f=b+z
g=c+z
h=d+z

v = np.array([ a, b, c, d, a]);
ax.plot(v[:,0], v[:,1], v[:,2], label='parametric curve')

#
#v = np.array([ e, f, g, h, e]);
#ax.plot(v[:,0], v[:,1], v[:,2], label='parametric curve')
#
#v = np.array([ a, e]);
#ax.plot(v[:,0], v[:,1], v[:,2], label='parametric curve')
#
#v = np.array([ b, f]);
#ax.plot(v[:,0], v[:,1], v[:,2], label='parametric curve')
#
#v = np.array([ c, g]);
#ax.plot(v[:,0], v[:,1], v[:,2], label='parametric curve')
#
#v = np.array([ d, h]);
#ax.plot(v[:,0], v[:,1], v[:,2], label='parametric curve')

q=Quaternion(0.25,0,1,0)
qa = getQuatFromVec3(a)
qb = getQuatFromVec3(b)
qc = getQuatFromVec3(c)
qd = getQuatFromVec3(d)

rotAxis = np.array([1,1,0])
rotAxis = rotAxis / Vec3(rotAxis).length()
tita = math.pi / 4

tita = tita/2
u = math.cos(tita)
v = rotAxis * math.sin(tita)

q = Quaternion(u, v[0], v[1], v[2])
ra = rotateByQ(a,q)
rb = rotateByQ(b,q)
rc = rotateByQ(c,q)
rd = rotateByQ(d,q)

vx = np.array([ ra, rb, rc, rd, ra]);
ax.plot(vx[:,0], vx[:,1], vx[:,2], label='parametric curve')

ax.legend()

plt.show()
