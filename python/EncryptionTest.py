import hashlib
from timeit import timeit
from datetime import datetime
#from M2Crypto import RSA
from Crypto.PublicKey import RSA

def probarSHA256(printMsg=True):
    text = b"I am Satoshi Nakamoto"

    # iterate nonce from 0 to 19
    for nonce in range(1,1001):

        # add the nonce to the end of the text
        input = text + (('0000' + str(nonce))[-4:]).encode('ascii')

        # calculate the SHA-256 hash of the input (text+nonce)
        hash = hashlib.sha256(input).hexdigest()

        # show the input and hash result
        if printMsg:
            if nonce % 200 == 0:
                print (input, '=>',  hash)
def probarPKGen():
    global key
    key = RSA.gen_key(1024, 65337)
    print(key)

def test(number=10):
    print(datetime.now())
    result = timeit('main(False)','from __main__ import main',number=number)
    print(datetime.now())
    print('Ejecuciones: ', number)
    print('Tiempo Total: ', round(result * 1000,1), 'ms')
    print('Tiempo por ejecucion; ', round(result / number * 1000,1), 'ms')

def main():
    print('Prueba de SHA256')
    print(datetime.now())
    probarSHA256()
    print(datetime.now())

    print(datetime.now())
    probarPKGen
    print(datetime.now())
    
main();
