import http.server
import sys

class StaticHandler(http.server.SimpleHTTPRequestHandler):
    pass

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    http.server.HTTPServer(('', port), StaticHandler).serve_forever()
