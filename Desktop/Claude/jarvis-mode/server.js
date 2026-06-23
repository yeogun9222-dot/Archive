const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const PORT = 7777;
const DIR = __dirname;

// .env 간단 파싱
function loadEnv() {
  try {
    const lines = fs.readFileSync(path.join(DIR, '.env'), 'utf8').split('\n');
    lines.forEach(line => {
      const [k, ...v] = line.split('=');
      if (k && v.length) process.env[k.trim()] = v.join('=').trim();
    });
  } catch (e) {}
}
loadEnv();

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.mp3': 'audio/mpeg',
};

// ── CLOVA Voice TTS ──
function clovaVoice(text, speaker = 'nbora') {
  return new Promise((resolve, reject) => {
    const clientId = process.env.CLOVA_CLIENT_ID;
    const clientSecret = process.env.CLOVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return reject(new Error('CLOVA 키 없음'));
    }

    const postData = querystring.stringify({
      speaker,
      text: text.substring(0, 1000),
      volume: 2,
      speed: -2,   // 빠르게
      pitch: 3,    // 밝고 높게 (츄 스타일)
      format: 'mp3',
    });

    const options = {
      hostname: 'naveropenapi.apigw.ntruss.com',
      path: '/tts-premium/v1/tts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-NCP-APIGW-API-KEY-ID': clientId,
        'X-NCP-APIGW-API-KEY': clientSecret,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => reject(new Error(`CLOVA ${res.statusCode}: ${Buffer.concat(chunks).toString()}`)));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  // ── CORS ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── POST /tts — CLOVA Voice 프록시 ──
  if (req.method === 'POST' && req.url === '/tts') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', async () => {
      try {
        const { text, speaker } = JSON.parse(body);
        if (!text) { res.writeHead(400); res.end('text required'); return; }

        const audio = await clovaVoice(text, speaker || 'nbora');
        res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Content-Length': audio.length });
        res.end(audio);
      } catch (e) {
        console.error('TTS 오류:', e.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // ── GET /tts-status — CLOVA 키 확인 ──
  if (req.url === '/tts-status') {
    const ok = !!(process.env.CLOVA_CLIENT_ID && process.env.CLOVA_CLIENT_SECRET);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ clova: ok }));
    return;
  }

  // ── 정적 파일 서빙 ──
  const filePath = path.join(DIR, req.url === '/' ? '/jarvis.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  const hasClova = !!(process.env.CLOVA_CLIENT_ID && process.env.CLOVA_CLIENT_SECRET);
  console.log(`JARVIS server: http://localhost:${PORT}`);
  console.log(`CLOVA Voice: ${hasClova ? '연결됨' : '키 없음 (브라우저 TTS 사용)'}`);
});
