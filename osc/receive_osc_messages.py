import OSC
import threading
 
#------OSC Server-------------------------------------#
receive_address = '127.0.0.1', 6789
 
# OSC Server. there are three different types of server. 
s = OSC.ThreadingOSCServer(receive_address)
 
# this registers a 'default' handler (for unmatched messages)
s.addDefaultHandlers()
 
 define a message-handler function for the server to call.
def printing_handler(addr, tags, stuff, source):
    if addr == '/antescofo/pitch':
        print "pitch is : ", stuff
 
#s.addMsgHandler("/test", printing_handler)
 
def main():
    # Start OSCServer
    print "Starting OSCServer"
    st = threading.Thread(target=s.serve_forever)
    st.start()
main()
