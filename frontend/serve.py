import http.server, os, sys

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?')[0].split('#')[0].lstrip('/')
        if path and not os.path.isfile(path):
            self.path = '/index.html'
        super().do_GET()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    http.server.HTTPServer(('', port), SPAHandler).serve_forever()
