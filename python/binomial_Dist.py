from itertools import *
from functools import reduce

def reducer(d, t):
    k=t[0]
    v=t[1]
    if k in d:
        d[k] = d[k] + v
    else:
        d[k] = v
    return d

def binomial(cant_steps):
    l = [ (0, 1.0) ]
    step = 1
    while step <= cant_steps:
        step = step + 1
        l0 = map(lambda t: (t[0], t[1]*0.5), l )
        l1 = map(lambda t: (t[0]+1, t[1]*0.5), l )
        l = list(chain(l0,l1))
        d = reduce(reducer, l, {})
        l = list(d.items())

    return l


