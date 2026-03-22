const http = require('http');

const port = process.env.ANTIGRAVITY_HUB_PORT || '8000';
const url = `http://127.0.0.1:${port}/api/status`;

console.log(`Checking URL: ${url}`);

http.get(url, (res) => {
    let data = '';
    console.log(`Response Status: ${res.statusCode}`);
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('SUCCESS:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('PARSE ERROR:', e.message);
            console.log('DATA:', data);
        }
    });
}).on('error', (err) => {
    console.log('CONNECTION ERROR:', err.message);
    console.log('CODE:', err.code);
});
