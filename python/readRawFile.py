path = 'C:\\Users\\yapjpe\\Documents\\My Received Files'
#archivo = '8327c58_3134CME9309152W2_MBB_543_TME840710TR4.xml'
#archivo = 'prueba_utf8.txt'
archivo = 'prueba_utf16.txt'
f = open(path + '\\' + archivo,'rb')

try:
    byte = f.read(1)
    while byte != b'':
        # Do stuff with byte.
        print (byte)
        byte = f.read(1)
finally:
    f.close()
