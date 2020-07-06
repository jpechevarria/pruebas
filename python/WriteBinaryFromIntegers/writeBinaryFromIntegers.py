
data = [-84, -19, 0, 5, 116, 0, 4, 84, 77, 48, 49]

export_file = open(r'C:\Users\yapjpe\Desktop\TMP\job_data.txt', 'wb')

for x in data:
    xByte = x.to_bytes(1,'big',signed=True)
    export_file.write(xByte)

export_file.close()
