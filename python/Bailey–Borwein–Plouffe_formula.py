def getPi(steps=6):

    acum = 0

    for k in range(0,steps):
        term1 = (1/pow(16,k))
        term2 = 4 / ( 8 * k + 1 )
        term3 = 2 / ( 8 * k + 4 )
        term4 = 1 / ( 8 * k + 5 )
        term5 = 1 / ( 8 * k + 6 )
        term = term1 * ( term2 - term3 - term4 - term5 )
        acum += term
    
    return acum

if __name__ == "__main__":
    print(getPi(5))

