const fetch = require('node-fetch');
const { Readable } = require('stream');

function toAbsoluteUrl(baseUrl, relativeUrl) {
  try {
    const url = new URL(relativeUrl, baseUrl);
    return url.href;
  } catch (e) {
    return relativeUrl;
  }
}

exports.handler = async (event, context) => {
  try {
    const videoUrl = event.queryStringParameters.url;

    if (!videoUrl) {
      return {
        statusCode: 400,
        body: 'Missing URL parameter'
      };
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      'Referer': event.headers.referer || 'https://www.google.com/'
    };

    const response = await fetch(videoUrl, { headers });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: `Failed to fetch video stream: ${response.statusText}`
      };
    }

    const readable = new Readable({
      async read() {
        const stream = response.body;
        for await (const chunk of stream) {
          const chunkStr = chunk.toString();
          const lines = chunkStr.split('\n');
          const modifiedLines = lines.map(line => {
            if (line.startsWith('#') || !line.trim()) {
              return line;
            }
            return toAbsoluteUrl(videoUrl, line);
          });
          this.push(modifiedLines.join('\n'));
        }
        this.push(null);
      }
    });

    const headersToForward = {};
    response.headers.forEach((value, name) => {
      headersToForward[name] = value;
    });

    // Add CORS header to headers being forwarded
    headersToForward['Access-Control-Allow-Origin'] = '*';
    
    // Netlify Functions does not handle streaming bodies directly. The best way is to return a base64 encoded body.
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);
    
    return {
      statusCode: 200,
      headers: headersToForward,
      body: bodyBuffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`
    };
  }
};
