const fetch = require('node-fetch');

// Function to convert relative URLs to absolute URLs
function toAbsoluteUrl(baseUrl, relativeUrl) {
  const url = new URL(relativeUrl, baseUrl);
  return url.href;
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
    
    // Read the HLS manifest as text
    let manifestText = await response.text();

    // Split the manifest by lines and rewrite relative URLs to absolute
    const lines = manifestText.split('\n');
    const modifiedLines = lines.map(line => {
      if (line.startsWith('#') || !line.trim()) {
        return line; // Skip comments and empty lines
      }
      return toAbsoluteUrl(videoUrl, line);
    });

    manifestText = modifiedLines.join('\n');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: manifestText
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`
    };
  }
};
