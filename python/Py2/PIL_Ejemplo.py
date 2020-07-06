from PIL import Image
import numpy as np
from numpy.core.numerictypes import typecodes

def f(x):
    return 255
fv = np.vectorize(f, 'B')


w, h = 512, 512
data = np.zeros((h, w, 3), dtype=np.uint8)
data = fv(data)
data[256, 256] = [255, 0, 0]

for x in xrange(0,512):
    for y in xrange(0,512):
        data[x,y] = [x, y, x*y]


img = Image.fromarray(data, 'RGB')
img.save('c:\\temp\\my.png')
#img.show()


