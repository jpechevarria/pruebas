import numpy as np
from PIL import Image
from datetime  import datetime
from decimal import Decimal
import math

def nonlin_sig(x,deriv=False):
	if(deriv==True):
	    return x*(1-x)

	return 1/(1+np.exp(-x))

def nonlin_relu(x,deriv=False):
        if(deriv==True):
                return ((np.sign(x)+1)/2)#*0.9+0.1

        return np.maximum(x,0.0*x)

LC_sig = 1
LC_relu = 0.01

nonlin1 = nonlin_sig
nonlin2 = nonlin_sig
LC = LC_sig

#nonlin1 = nonlin_relu
#LC = LC_relu

cant_casos = 10000
cant_pasos = 1000000
hidden_neurons = 20
blocksize = 20
pasadas_por_bloque = 10


print "Cant Casos:" + str(cant_casos)
print "Cant Pasos:" + str(cant_pasos)

DIM = 3.2
a = (np.random.random((cant_casos,2)) * 2 - 1) * 1 #DIM
a = np.insert(a,2,1,1)
b = []

def denormalize(x, y):
        return ( x * DIM, y * DIM)

def normalize(x,y):
        return ( x/DIM, y/DIM )

# CUADRANTE POSITIVO
def evaluate1( x ):
        (px,py) = denormalize(x[0], x[1])
        if px > 0 and py > 0:
                b.append([1])
        else:
                b.append([0])

# CUADRANTE POSITIVO Y CUADRANTE NEGATIVO
def evaluate1_a( x ):
        (px,py) = denormalize(x[0], x[1])
        if (px > 0 and py > 0) or (px < 0 and py < 0):
                b.append([1])
        else:
                b.append([0])

#UN CUADRADO
def evaluate2( x ):
        (px,py) = denormalize(x[0], x[1])
        if px >= -1 and px <= 1 and py >= -1 and py <= 1:
                b.append([1])
        else:
                b.append([0])

#UN CIRCULO
def evaluate3( x ):
        (px,py) = denormalize(x[0], x[1])
        if px*px + py*py <= 1:
                b.append([1])
        else:
                b.append([0])

#SENO
def evaluate4( x ):
        (px,py) = denormalize(x[0], x[1])
        if py >= (1*math.sin(6 * (px+3.2))):
                b.append([1])
        else:
                b.append([0])

#DOS RECTANGULOS
def evaluate5( x ):
        (px,py) = denormalize(x[0], x[1])
        if px >= -2 and px <= -1 and py >= -1 and py <= 1:
                b.append([1])
        elif px >= 1 and px <= 2 and py >= -1 and py <= 1:
                b.append([1])
        else:
                b.append([0])

#dos circulos
def evaluate6( x ):
        (px,py) = denormalize(x[0], x[1])
        cx,cy = 1.5, 0.0
        cx2,cy2 = -1.5, 0.0
        if (px-cx)**2 + (py-cy)**2 <= 1:
                b.append([1])
        elif (px-cx2)**2 + (py-cy2)**2 <= 1:
                b.append([1])
        else:
                b.append([0])

#cuatro circulos
def evaluate7( x ):
        (px,py) = denormalize(x[0], x[1])
        cx,cy = 1.5, 1.5
        cx2,cy2 = -1.5, -1.5
        cx3,cy3 = -1.5, 1.5
        cx4,cy4 = 1.5, -1.5
        if (px-cx)**2 + (py-cy)**2 <= 1:
                b.append([1])
        elif (px-cx2)**2 + (py-cy2)**2 <= 1:
                b.append([1])
        elif (px-cx3)**2 + (py-cy3)**2 <= 1:
                b.append([1])
        elif (px-cx4)**2 + (py-cy4)**2 <= 1:
                b.append([1])
        else:
                b.append([0])

#UN ANILLO
def evaluate8( x ):
        (px,py) = denormalize(x[0], x[1])
        dist_cuad = px*px + py*py
        if dist_cuad >= 1 and dist_cuad <= 2.25:
                b.append([1])
        else:
                b.append([0])
        
evaluate=evaluate8

def test(x, y):
        l0 = np.array([ [ x, y, 1 ] ]);
        l1 = nonlin1(np.dot(l0,syn0))
        l2 = nonlin2(np.dot(l1,syn1))
        #l3 = nonlin3(np.dot(l2,syn2))
        return l2

#imagen
def plot(size):
        ratio = int(8192 / size)
        if ratio > 256:
                ratio = 256
        ratio = 1
        X=X0
        y=y0
        #print 'Inicio Image: ' + str(datetime.today())
        w, h = size, size
        w_2, h_2 = w / 2.0, h / 2.0
        data = np.zeros((h, w, 3), dtype=np.uint8)

        # DIBUJA LOS CASOS DE TEST
        for px in xrange(0,w):
            for py in xrange(0,h):
                u = (px/w_2-1)#*DIM
                v = -(py/h_2-1)#*DIM
                v = test(u,v);
                v = v[0,0]*255;
                data[py,px] = [v,v,v]

        # DIBUJA LOS CASOS DE TRAINING
        for i in xrange(0,len(X)):
                if i % ratio == 0:
                        t=X[i]
                        px=t[0]
                        py=-t[1]
                        px, py = denormalize(px, py)
                        s=y[i]
                        u = int((px + DIM)/DIM * w_2)
                        v = int((py + DIM)/DIM * h_2)
                        if s == 1:
                                color = [0,255,0]
                        if s == 0:
                                color = [255,0,0]
                        #if u > w-2: u = w-2
                        #if v > h-2: v = h-2
                        data[v,u] = color
                        #data[u+1,v] = color
                        #data[u+1,v+1] = color
                        #data[u,v+1] = color

        img = Image.fromarray(data, 'RGB')
        img.save(r'c:\temp\my.png')

        #print 'Fin Image: ' + str(datetime.today())


np.apply_along_axis( evaluate, axis=1, arr=a )
cant_casos = len(b)

X = np.array([[0,0,1],
            [0,1,1],
            [1,0,1],
            [1,1,1]])
                
y = np.array([[0],
              [1],
              [0],
              [1]])

X = a
y = np.array(b).astype('g')

X0=X
y0=y

np.random.seed(1)

# randomly initialize our weights with mean 0
syn0 = 2*np.random.random((3,hidden_neurons)) - 1
syn1 = 2*np.random.random((hidden_neurons,1)) - 1
#syn2 = 2*np.random.random((2,1)) - 1

try:
        for j in xrange(cant_pasos):

            # Feed forward through layers 0, 1, and 2

            #V2
            sini = int(j / pasadas_por_bloque) * blocksize
            sini = sini % cant_casos
            sfin = sini + blocksize;

            if sfin < cant_casos:
                X = X0[sini:sfin]
                y = y0[sini:sfin]
            else:
                sfin2 = sfin % cant_casos
                X = np.concatenate((X0[sini:sfin],X0[0:sfin2]),0)
                y = np.concatenate((y0[sini:sfin],y0[0:sfin2]),0)
           
            l0 = X
            l1 = nonlin1(np.dot(l0,syn0))
            l2 = nonlin2(np.dot(l1,syn1))
            #l3 = nonlin3(np.dot(l2,syn2))

            #print 'Max L1: ' + str(np.max(l1)) + ' - Max L2: ' + str(np.max(l2))

            # how much did we miss the target value?
            l2_error = y - l2
            #l3_error = y - l3
            #mean_error=np.mean(np.abs(l2_error))
            #LC = math.sqrt(2*mean_error)
            if (j% 200) == 0:
                mean_error=np.mean(np.abs(l2_error))
                LC = math.sqrt(mean_error)
                #max_error = np.max(np.abs(l2_error))
                #LC = math.sqrt(max_error)
                print "Error:" + "{:.8f}".format(mean_error) + " - sini: " + str(sini) + " - j: " + str(j)
            if (j% 5000) == 0:
                print "."
                plot(256)
                
            # in what direction is the target value?
            # were we really sure? if so, don't change too much.
            l2_delta = l2_error*nonlin2(l2,deriv=True)
            #l3_delta = l3_error*nonlin3(l3,deriv=True)

            # how much did each l1 value contribute to the l2 error (according to the weights)?
            l1_error = l2_delta.dot(syn1.T)
            #l2_error = l3_delta.dot(syn2.T)
            
            # in what direction is the target l1?
            # were we really sure? if so, don't change too much.
            l1_delta = l1_error * nonlin1(l1,deriv=True)
            #l2_delta = l2_error * nonlin2(l2,deriv=True)

            #syn2 += l2.T.dot(l3_delta)
            syn1 += l1.T.dot(l2_delta)*LC
            syn0 += l0.T.dot(l1_delta)*LC
except (KeyboardInterrupt):
        print "Se corta proceso"


#print "Output After Training:"
#print l2

l0 = X
l1 = nonlin1(np.dot(l0,syn0))
l2 = nonlin2(np.dot(l1,syn1))
#l3 = nonlin3(np.dot(l2,syn2))


salida = l2.round(2)
salida = np.transpose(salida)

conv0 = np.array([[1],[0]])
conv1 = np.array([[0],[1]])

salida = np.dot(conv0,salida)
y2= np.dot(conv1,np.transpose(y))

final = np.transpose(salida + y2)

#print(final)

plot(256)
