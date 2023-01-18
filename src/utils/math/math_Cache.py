import time

def GetTTLHash(seconds=86400):
    return round(time.time() / seconds)