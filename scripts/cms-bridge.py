"""Private CMS bridge. Credentials arrive only through hidden stdin, never flags or files."""
import sys, json, urllib.request, urllib.parse, urllib.error, base64, hashlib
def main():
    if sys.stdin.isatty():
        import termios
        settings = termios.tcgetattr(sys.stdin)
        # Canonical terminal input truncates long article JSON near 4 KB.
        settings[3] &= ~(termios.ECHO | termios.ICANON)
        settings[6][termios.VMIN] = 1
        settings[6][termios.VTIME] = 0
        termios.tcsetattr(sys.stdin, termios.TCSADRAIN, settings)
        print('Ready for private CMS JSON on stdin (input is hidden).', flush=True)
    data = json.loads(sys.stdin.readline())
    origin = data['origin'].rstrip('/')
    if origin != 'https://he-article-cms.hendraw83.chatgpt.site':
        raise ValueError('Use only the configured private HE CMS origin.')
    proof=hashlib.sha256(data['token'].encode()).hexdigest()
    mode = data['mode']
    if mode == 'outbox':
        path, method, payload = '/api/service/outbox', 'GET', None
    elif mode == 'media':
        media_id = data['mediaId']
        if not all(x in 'abcdef0123456789-' for x in media_id) or len(media_id) != 36:
            raise ValueError('Invalid media ID.')
        path = '/api/service/media/' + media_id + '?job=' + urllib.parse.quote(data['jobId'], safe='')
        method, payload = 'GET', None
    elif mode in ['claim','ack','conflict','import']:
        path, method, payload = '/api/service/' + mode, 'POST', json.dumps(data['body']).encode()
    else:
        raise ValueError('Unknown bridge operation.')
    req = urllib.request.Request(origin + path, data=payload, method=method,
        headers={'OAI-Sites-Authorization':'Bearer ' + data['token'],'X-CMS-Sync-Proof':proof,'Content-Type':'application/json'})
    # Do not follow redirects while carrying the service credential.
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None
    opener = urllib.request.build_opener(NoRedirect)
    with opener.open(req, timeout=35) as response:
        raw=response.read()
        if mode=='media':
            mime=response.headers.get('Content-Type','').split(';')[0]
            ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'}.get(mime)
            if not ext or len(raw)>8*1024*1024:
                raise ValueError('Invalid image response.')
            print(json.dumps({'path':'assets/articles/'+media_id+'.'+ext,'content':base64.b64encode(raw).decode(),'encoding':'base64'}),flush=True)
        else:
            print(json.dumps(json.loads(raw)),flush=True)
if __name__=='__main__':
    try:
        main()
    except urllib.error.HTTPError as error:
        print(json.dumps({'error':'HTTPError','status':error.code,'message':'CMS rejected the operation; check permissions, input and queue state before retrying.'}),flush=True)
        sys.exit(1)
    except Exception as error:
        print(json.dumps({'error':type(error).__name__,'message':'CMS operation failed; check service access and queue state before retrying.'}),flush=True)
        sys.exit(1)
