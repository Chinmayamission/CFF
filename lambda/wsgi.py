"""
WSGI entry point for running the CFF application with gunicorn.
Serves both the Chalice API (under /api/) and static frontend files.
"""

import os
import sys
import mimetypes

# Add lambda directory to path so chalicelib can be imported
lambda_dir = os.path.dirname(os.path.abspath(__file__))
if lambda_dir not in sys.path:
    sys.path.insert(0, lambda_dir)

from chalice.local import LocalGateway, ChaliceRequestHandler
from chalice.config import Config
from chalicelib.main import app as chalice_app

# Ensure common MIME types are registered
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

# Path to static files (frontend build)
STATIC_DIR = os.environ.get('STATIC_DIR', '/app/static')


class ChaliceWSGIAdapter:
    """Adapter to convert Chalice app to WSGI interface."""

    def __init__(self, app):
        self.app = app
        # Create a minimal config for the LocalGateway
        config = Config()
        self.gateway = LocalGateway(app, config)

    def __call__(self, environ, start_response):
        # Build the request from WSGI environ
        method = environ['REQUEST_METHOD']
        path = environ.get('PATH_INFO', '/')

        # Remove /api prefix if present
        if path.startswith('/api'):
            path = path[4:] or '/'

        # Get query string
        query_string = environ.get('QUERY_STRING', '')
        if query_string:
            path = f"{path}?{query_string}"

        # Get headers
        headers = {}
        for key, value in environ.items():
            if key.startswith('HTTP_'):
                header_name = key[5:].replace('_', '-').lower()
                headers[header_name] = value
            elif key in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
                header_name = key.replace('_', '-').lower()
                headers[header_name] = value

        # Get body
        body = None
        content_length = environ.get('CONTENT_LENGTH')
        if content_length:
            body = environ['wsgi.input'].read(int(content_length))

        # Handle the request through Chalice
        response = self.gateway.handle_request(method, path, headers, body)

        # Build response
        status = f"{response['statusCode']} OK"
        response_headers = list(response.get('headers', {}).items())

        # Add CORS headers if not present
        header_names = [h[0].lower() for h in response_headers]
        if 'access-control-allow-origin' not in header_names:
            response_headers.append(('Access-Control-Allow-Origin', '*'))

        start_response(status, response_headers)

        body = response.get('body', '')
        if isinstance(body, str):
            body = body.encode('utf-8')

        return [body]


def serve_static_file(file_path, start_response):
    """Serve a static file."""
    try:
        with open(file_path, 'rb') as f:
            content = f.read()

        content_type, _ = mimetypes.guess_type(file_path)
        if content_type is None:
            content_type = 'application/octet-stream'

        headers = [
            ('Content-Type', content_type),
            ('Content-Length', str(len(content))),
            ('Cache-Control', 'public, max-age=31536000' if not file_path.endswith('.html') else 'no-cache'),
        ]
        start_response('200 OK', headers)
        return [content]
    except FileNotFoundError:
        return None


def application(environ, start_response):
    """Main WSGI application that routes between API and static files."""
    path = environ.get('PATH_INFO', '/')
    method = environ['REQUEST_METHOD']

    # Handle CORS preflight
    if method == 'OPTIONS':
        headers = [
            ('Access-Control-Allow-Origin', '*'),
            ('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS'),
            ('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token'),
            ('Access-Control-Max-Age', '86400'),
            ('Content-Length', '0'),
        ]
        start_response('200 OK', headers)
        return [b'']

    # Route /api/* to Chalice backend
    if path.startswith('/api'):
        chalice_adapter = ChaliceWSGIAdapter(chalice_app)
        return chalice_adapter(environ, start_response)

    # Serve static files
    if os.path.isdir(STATIC_DIR):
        # Try exact path first
        if path == '/':
            file_path = os.path.join(STATIC_DIR, 'index.html')
        else:
            # Sanitize path to prevent directory traversal
            safe_path = os.path.normpath(path.lstrip('/'))
            if safe_path.startswith('..'):
                start_response('403 Forbidden', [('Content-Type', 'text/plain')])
                return [b'Forbidden']
            file_path = os.path.join(STATIC_DIR, safe_path)

        # Try serving the file
        result = serve_static_file(file_path, start_response)
        if result is not None:
            return result

        # For SPA routing, serve index.html for non-file paths
        if '.' not in os.path.basename(path):
            index_path = os.path.join(STATIC_DIR, 'index.html')
            result = serve_static_file(index_path, start_response)
            if result is not None:
                return result

    # 404 for everything else
    start_response('404 Not Found', [('Content-Type', 'text/plain')])
    return [b'Not Found']


# For gunicorn: gunicorn lambda.wsgi:app
app = application
