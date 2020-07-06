from multiprocessing import Pool

def f(x):
    return x*x

if __name__ == '__main__':
    with Pool(4) as p:
        x=p.map(f, range(1,10000000))
    print(type(x))
    print('len: ' + str(len(x)))
    print('pri: ' + str(x[0]))
    print('ult: ' + str(x[-1]))
