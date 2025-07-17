const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    // Get the video URL from the query string
    const videoUrl = event.queryStringParameters.url;

    if (!videoUrl) {
      return {
        statusCode: 400,
        body: 'Missing URL parameter'
      };
    }

    // --- New: Add a headers object to mimic a browser request ---
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      'Referer': event.headers.referer || 'https://www.google.com/' 
    };

    // Fetch the video stream with the new headers
    const response = await fetch(videoUrl, { headers });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: `Failed to fetch video stream: ${response.statusText}`
      };
    }

    // Set the CORS header and return the stream
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: await response.text()
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`
    };
  }
};
