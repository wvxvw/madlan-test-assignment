#!/usr/bin/python

import logging

from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from optparse import OptionParser
from os import path
from urlparse import urlparse

class PTDevHandler(BaseHTTPRequestHandler):

    www = path.join(path.dirname(path.realpath(__file__)), '../')
    
    statics = { '.html' : 'text/html',
                '.htm' : 'text/html',
                '.jpg' : 'image/jpg',
                '.jpeg' : 'image/jpg',
                '.png' : 'image/png',
                '.mp3' : 'audio/mpeg',
                '.xml' : 'text/xml',
                '.swf' : 'application/x-shockwave-flash',
                '.gif' : 'image/gif',
                '.js' : 'application/javascript',
                '.css' : 'text/css' }

    def serve_static(self, file, mime):
        '''The handler for static files'''
        try:
            with open(path.join(self.www, file), 'r') as served:
                self.send_response(200)
                self.send_header('Content-type', mime)
                self.end_headers()
                self.wfile.write(served.read())
        except IOError:
            self.send_error(404, 'File Not Found: %s' % self.path)

    def do_GET(self):
        '''Mandatory GET handler'''
        url = urlparse(self.path)
        extension = path.splitext(url.path)[1] or '.html'
        if self.path == '/':
            self.serve_static('web/index.html', self.statics['.html'])
        elif extension.lower() in self.statics:
            self.serve_static(url.path[1:], self.statics[extension.lower()])
        else:
            self.send_error(500, 'Don\'t know what to do with: %s' % self.path)

if __name__ == '__main__':
    parser = OptionParser()
    parser.add_option(
        '-p', '--port', dest = 'port', default = 8080,
        help = '''The port operated by HTTP server.
        Defaults to 8080.''')

    parser.add_option(
        '-v', '--verbose', dest = 'verbose', action = 'count',
        help = 'Increase verbosity (specify multiple times for more)')

    options, args = parser.parse_args()
        
    log_level = logging.WARNING
    if options.verbose == 1:
        log_level = logging.INFO
    elif options.verbose >= 2:
        log_level = logging.DEBUG

    logging.basicConfig(level = log_level)

    try:
        server = HTTPServer(('', int(options.port)), PTDevHandler)
        logging.info('Starting on port: %s...' % options.port)
        server.serve_forever()

    except KeyboardInterrupt:
        logging.info('^C Shutting down...')
        server.socket.close()
