"""Exercise the real private-stdin transport without sending any network request."""
import json
import os
import pty
import select
import subprocess
import time
import unittest
from pathlib import Path

SCRIPT = Path(__file__).with_name('cms-bridge.py')

def invoke(data):
    master, slave = pty.openpty()
    process = subprocess.Popen(['python', str(SCRIPT)], stdin=slave, stdout=slave, stderr=slave)
    os.close(slave)
    output = b''
    try:
        deadline = time.monotonic() + 5
        while b'(input is hidden).' not in output and time.monotonic() < deadline:
            if select.select([master], [], [], .1)[0]:
                output += os.read(master, 4096)
        if b'(input is hidden).' not in output:
            raise AssertionError('Private input was not ready.')
        raw = (json.dumps(data) + '\n').encode()
        for start in range(0, len(raw), 1024):
            os.write(master, raw[start:start+1024])
        while time.monotonic() < deadline:
            if select.select([master], [], [], .1)[0]:
                try:
                    output += os.read(master, 4096)
                except OSError:
                    break
            elif process.poll() is not None:
                break
        process.wait(timeout=2)
        decoded = output.decode().replace('\r', '')
        result = json.loads(decoded.strip().splitlines()[-1])
        return process.returncode, result, decoded
    finally:
        if process.poll() is None:
            process.kill()
        process.wait()
        os.close(master)

class BridgeTransportTest(unittest.TestCase):
    def test_large_article_reaches_origin_validation_without_truncation_or_echo(self):
        status, result, output = invoke({'origin':'https://invalid.example','token':'qa-private-token','mode':'import','body':{'text':'article '*8000}})
        self.assertEqual(status, 1)
        self.assertEqual(result['error'], 'ValueError')
        self.assertNotIn('qa-private-token', output)
        self.assertLess(len(output), 1000)

    def test_other_origins_are_rejected_before_any_request(self):
        for origin in ['https://he-article-cms.hendraw83.chatgpt.site:443','https://he-article-cms.hendraw83.chatgpt.site/?redirect=x','https://another.hendraw83.chatgpt.site']:
            with self.subTest(origin=origin):
                status, result, output = invoke({'origin':origin,'token':'qa-private-token','mode':'outbox'})
                self.assertEqual(status, 1)
                self.assertEqual(result['error'], 'ValueError')
                self.assertNotIn('qa-private-token', output)

    def test_unknown_operation_does_not_send_a_request(self):
        status, result, _ = invoke({'origin':'https://he-article-cms.hendraw83.chatgpt.site','token':'qa-private-token','mode':'unknown'})
        self.assertEqual(status, 1)
        self.assertEqual(result['error'], 'ValueError')

if __name__ == '__main__':
    unittest.main()
