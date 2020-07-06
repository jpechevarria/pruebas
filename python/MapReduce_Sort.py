from datetime import *
from random import *
from functools import reduce

d = dict()

def strReducePar(t):
    if ( type(t) == tuple):
        return 'tuple(' + str(t[0]) + ',list(' + str(len(t[1])) + ' items))'
    if ( type(t) == dict):
        return 'dict(' + str(len(t.keys())) + ' keys)'
    
    return 'desconocido: ' + str(type(t))

def reducer(x, y):
    global d
    #print('Reducing X=' + strReducePar(x) + ' Y= ' + strReducePar(y) )
    if ( type(x) == dict and type(y) == dict):
        return d

    if ( type(x) == tuple):
        #print('adding x')
        key = x[0]
        val = x[1]
        d[key] = val

    if ( type(y) == tuple):
        #print('adding y')
        key = y[0]
        val = y[1]
        d[key] = val

    #print('d size: ' + str(len(d.keys())))

    return d

def mapSorter(l):
    l.sort()
    return l

def reducerSorter(l1, l2):
    l3 = list()
    c = [0, 0]
    ll = [l1, l2]
    while True:
        v = [ None, None ]
        vf = None
        if c[0] < len(ll[0]):
            v[0] = ll[0][c[0]]

        if c[1] < len(ll[1]):
            v[1] = ll[1][c[1]]

        selected = None
        
        if v[0] == None and v[1] == None:
            break
        
        if v[0] != None and v[1] != None:
            if v[0] <= v[1]:
                selected = 0
            else:
                selected = 1
        else:
            if v[0] != None and v[1] == None:
                selected = 0
            if v[0] == None and v[1] != None:
                selected = 1

        vf=v[selected]
        c[selected] = c[selected] + 1
        l3.append(vf)
    print('.' + str(len(l3)))
    return l3

def main():
    size = 1000

    print('Generando datos: ' + str(datetime.now()))
    raiz = range(1,size+1)

    mapResult = list(map(lambda x: (x,[int(random()*10000) for i in range(1,size+1)]), raiz))

    reduce(reducer,mapResult)

    print('Fin: ' + str(datetime.now()))
    print('Registros: ' + str(reduce(lambda x,y: x+ y,map(lambda x: len(d[x]), d.keys()))))
    #print(reduce(lambda x, y: x+y,map(lambda x: len(x[1]), d)))

    mapResSort = list(map(mapSorter, d.values()))

    #print(mapResSort)

    reduceResultSort = reduce(reducerSorter,mapResSort)

    #print(reduceResultSort)

