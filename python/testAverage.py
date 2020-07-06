import random
import math

def promedio(L):
    N=len(L)
    ret=math.fsum(map(lambda x: x/N,L))
    return ret

print('Inicio')
A = [random.randint(0, 10000) for x in range(0,100000)]
"A = [1e+308 for x in range(0,100000)]"
x = 0
y = 0
N = len(A)
for i in range(0,N):
    x += A[i] // N
    b = A[i] % N
    if (y >= N - b):
        x+=1
        y -= N - b
    else:
        y += b

print('Suma: ' + str(sum(A)) )
print('N: ' + str(len(A)) )
print('Suma/N: ' + str( sum(A)/len(A) ) )
print('Average 1: ' + str( x + (y / N) ) )
print('Average 2: ' + str( promedio(A) ) )
print('Fin')
"/* Average is exactly x + y / N, 0 <= y < N. */"
print(1e+308)

