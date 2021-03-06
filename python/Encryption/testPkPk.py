from Crypto.PublicKey import RSA
from Crypto import Random

random_generator = Random.new().read
key = RSA.generate(1024, random_generator)

print(key.exportKey().decode())
print(key.publickey().exportKey().decode())
