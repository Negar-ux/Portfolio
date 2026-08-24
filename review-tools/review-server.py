#!/usr/bin/env python3
"""
Local review server for the portfolio.

Serves the site exactly as python -m http.server does, with two additions:

  1. Any .html request carrying ?review=1 gets a commenting overlay injected
     just before </body>. The files on disk are never modified, so nothing
     about this can reach the live site.
  2. POST /__review/save writes the comment list to review-comments.json in
     the repo root, where Claude can read it.

Usage:
    python review-tools/review-server.py            # port 8080
    python review-tools/review-server.py 8090       # any other port

Then open, for example:
    http://localhost:8080/fitness-app.html?review=1
"""
import http.server
import io
import json
import os
import posixpath
import sys
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.join(ROOT, 'review-tools')
STORE = os.path.join(ROOT, 'review-comments.json')

INJECT = (
    '<link rel="stylesheet" href="/__review/overlay.css">\n'
    '<script src="/__review/overlay.js" defer></script>\n'
)


EMPTY = {'currentRound': 1, 'rounds': []}


def load_comments():
    if not os.path.exists(STORE):
        return dict(EMPTY)
    try:
        with io.open(STORE, encoding='utf-8') as fh:
            data = json.load(fh)
    except (ValueError, OSError):
        return dict(EMPTY)
    # tolerate the older flat-list format
    if isinstance(data, list):
        return {'currentRound': 1,
                'rounds': [{'round': 1, 'submitted': None,
                            'status': 'draft', 'comments': data}]}
    return data


def save_comments(items):
    with io.open(STORE, 'w', encoding='utf-8') as fh:
        json.dump(items, fh, indent=2, ensure_ascii=False)


class Handler(http.server.SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, fmt, *args):
        # keep the console quiet apart from review activity
        if '__review' in (args[0] if args else ''):
            super().log_message(fmt, *args)

    # ---------------------------------------------------------------- GET
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = urllib.parse.unquote(parsed.path)
        query = urllib.parse.parse_qs(parsed.query)

        if path.startswith('/__review/'):
            return self._serve_tool(path)

        if path == '/__review-comments':
            return self._send_json(load_comments())

        # inject the overlay into html when review mode is on
        if path.endswith('.html') and query.get('review'):
            disk = os.path.join(ROOT, path.lstrip('/').replace('/', os.sep))
            if os.path.isfile(disk):
                return self._serve_injected(disk)

        return super().do_GET()

    def _serve_tool(self, path):
        name = posixpath.basename(path)
        disk = os.path.join(TOOLS, name)
        if not os.path.isfile(disk):
            self.send_error(404, 'no such review asset')
            return
        ctype = 'text/css' if name.endswith('.css') else 'application/javascript'
        with open(disk, 'rb') as fh:
            body = fh.read()
        self.send_response(200)
        self.send_header('Content-Type', ctype + '; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def _serve_injected(self, disk):
        with io.open(disk, encoding='utf-8') as fh:
            html = fh.read()
        if '</body>' in html:
            html = html.replace('</body>', INJECT + '</body>', 1)
        else:
            html += INJECT
        body = html.encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def _send_json(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    # --------------------------------------------------------------- POST
    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != '/__review/save':
            self.send_error(404, 'unknown endpoint')
            return
        try:
            length = int(self.headers.get('Content-Length', 0))
            payload = json.loads(self.rfile.read(length).decode('utf-8'))
        except (ValueError, TypeError):
            self._send_json({'ok': False, 'error': 'bad payload'}, 400)
            return
        if not isinstance(payload, dict) or 'rounds' not in payload:
            self._send_json({'ok': False, 'error': 'expected {currentRound, rounds}'}, 400)
            return
        save_comments(payload)
        total = sum(len(r.get('comments', [])) for r in payload.get('rounds', []))
        self._send_json({'ok': True, 'rounds': len(payload['rounds']), 'comments': total})


class Server(http.server.ThreadingHTTPServer):
    # threaded: a browser holding a keep-alive connection must not block
    # every other request, which a single-threaded server would do
    daemon_threads = True
    allow_reuse_address = True


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    with Server(('', port), Handler) as httpd:
        print('review server on http://localhost:%d' % port)
        print('open a page with ?review=1, e.g.')
        print('   http://localhost:%d/fitness-app.html?review=1' % port)
        print('comments are written to %s' % STORE)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nstopped')


if __name__ == '__main__':
    main()
