import Tkinter as tk
from PIL import Image, ImageTk
import time

root = tk.Tk()

root.title("display a website image")

path = r"C:\Temp\my.png"

#Creates a Tkinter-compatible photo image, which can be used everywhere Tkinter expects an image object.
img = None
go = True
try:
    img = ImageTk.PhotoImage(Image.open(path))
except:
    go = False
    
#The Label widget is a standard Tkinter widget used to display a text or image on the screen.
panel = tk.Label(root, image = img)

#The Pack geometry manager packs widgets in rows or columns.
panel.pack(side = "bottom", fill = "both", expand = "yes")

#un texto
lblTexto = tk.Label(root, text = "prueba")
lblTexto.pack(side = "bottom", fill = "both", expand = "yes")

i=0

def show():
    global i, panel, lblTexto
    i=i+1
    print i
    now = time.strftime("%H:%M:%S")
    lblTexto.configure(text=now)
    go = True
    try:
        img = ImageTk.PhotoImage(Image.open(path))
    except:
        go = False
    if go:
        panel.image = img
        panel.configure(image = img)
    
    root.after(1000,show)

root.after(1000,show)

#show()

root.mainloop()
