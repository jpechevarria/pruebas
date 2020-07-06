from joblib import Parallel, delayed
from datetime import datetime

def f(x):
    return x**2

def main():

    cant = 100000
    jobs = 2
    print 'Cantidad: {}'.format(cant)
    print datetime.now()
    result = Parallel(n_jobs=jobs, backend="threading")(delayed(f)(i) for i in xrange(cant))
    result = [f(i) for i in xrange(cant)]
    print datetime.now()

    print result[0:10]
    print result[-10:]

if __name__ == '__main__':
    main()
