"""
Calculate pi using random numbers
"""

import math
import random
import datetime

print('Inicio: ' + str(datetime.datetime.today()))

# So far we have not found any values inside the unit circle
found = 0
trials = 10000000
for i in range(trials):
    x, y = random.random(), random.random()
    if math.sqrt(x * x + y * y) < 1:
        found += 1

print('Fin: ' + str(datetime.datetime.today()))

print((float(found) / trials) * 4)

