import tempfile
import urllib
from urllib.request import urlretrieve


print("Ingrese password para el proxy")
pwd = input()
proxy_str = 'http://yapjpe:{0}@TERARSVCBCPRX02'.format(pwd)
proxy = urllib.request.ProxyHandler({'http': proxy_str})
opener = urllib.request.build_opener(proxy)
urllib.request.install_opener(opener)


#train_file = tempfile.NamedTemporaryFile()
#urlretrieve("http://mlr.cs.umass.edu/ml/machine-learning-databases/adult/adult.data", train_file.name)
(filename, headers) = urlretrieve("http://mlr.cs.umass.edu/ml/machine-learning-databases/adult/adult.data")
print("Filename: " + filename)
print("headers: " + str(headers))

#test_file = tempfile.NamedTemporaryFile()
#urlretrieve("http://mlr.cs.umass.edu/ml/machine-learning-databases/adult/adult.test", test_file.name)
(filename, headers) = urlretrieve("http://mlr.cs.umass.edu/ml/machine-learning-databases/adult/adult.test")
print("Filename: " + filename)
print("headers: " + str(headers))
