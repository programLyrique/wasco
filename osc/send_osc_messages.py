#!/usr/bin/python2
# This Python file uses the following encoding: utf-8

import OSC
import time

# Init OSC
client = OSC.OSCClient()
msg = OSC.OSCMessage()

msg.setAddress("/antescofo/loadscore")
msg.append("/home/moumouh/TÃ©lÃ©chargements/Antescofo-pd-linux-v0.91/Antescofo-pd-linux-v0.91/Asco_Examples/Reich_Sample.asco.txt")

# msg.setArgs([ { type: 's',value: ""}])
client.sendto(msg, ('127.0.0.1', 5678))
msg.clearData()
# for i in range(10):
#     time.sleep(1)
#     msg.append(i)
#     try:
#         client.sendto(msg, ('127.0.0.1', 6789))
#         msg.clearData()
#     except:
#         print 'Connection refused'
#         pass
    
    
