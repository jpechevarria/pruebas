from decimal import *
from math import *
from datetime import *

def pi_gen(maxN = -1):
    currPrec = getcontext().prec
    n = 0
    pi = Decimal(0)
    inv16 = Decimal(1)
    n8 = Decimal(0)
    while ( maxN == -1 or n < maxN ):
        term = Decimal(0)
        term += 4 / ( n8 + 1 )
        term -= 2 / ( n8 + 4 )
        term -= 1 / ( n8 + 5 )
        term -= 1 / ( n8 + 6 )
        term *= inv16
        pi += term
        if ( term < pow(10,-currPrec) ):
            break
        yield pi #, term
        n += 1
        n8 += 8
        inv16 /= 16
    print('Precision: ' + str(currPrec))
    print('Iteraciones: ' + str(n))

def proceso(precision = 100, iteraciones = -1, output = True):
    print(datetime.now())
    prevPrec = getcontext().prec
    getcontext().prec = precision
    for i in pi_gen(iteraciones):
        pass
        #texto = str(i)
        texto = dec_to_hex(i)
        if output:
            print(texto)
    getcontext().prec = prevPrec
    print(datetime.now())

def main():
    proceso(100, 100)

def dec_to_hex(dec):
    if ( dec < 0 ):
        return '-' + dec_to_hex(-dec)
    entero = secure_floor(dec)
    ret = _dec_to_hex_ent(entero)
    resto = dec - entero
    if resto > 0:
        ret = ret + '.' + _dec_to_hex_dec(resto, 0)
    return ret

def _dec_to_hex_ent(dec):
    resto = dec % 16
    if dec > 15:
        div = floor(dec / 16)
        return _dec_to_hex_ent( div ) + hexdigit(resto)
    else:
        return hexdigit(resto)
    
def _dec_to_hex_dec(dec, depth):
    if dec == 0 : return ''
    if ( depth > getcontext().prec) : return ''
    mult = dec * 16
    entero = secure_floor(mult)
    resto = mult - entero
    return hexdigit(entero) + _dec_to_hex_dec(resto, depth+1)

def secure_floor(dec):
    if type(dec) is Decimal:
        return dec.to_integral_exact(rounding=ROUND_FLOOR)
    else:
        return floor(dec)
    
def hexdigit(d):
    if ( d == floor(d) ):
        if ( d >=0 ):
            if ( d <= 9 ):
                return str(d)
            if ( d <= 15 ):
                return chr(65 + d - 10);
    raise InvalidOperation

#main()
