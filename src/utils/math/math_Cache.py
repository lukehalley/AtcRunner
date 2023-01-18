import time

def GetTTLHash(seconds=3600):
    return round(time.time() / seconds)