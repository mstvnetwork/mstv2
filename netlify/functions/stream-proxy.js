const fetch = require('node-fetch');

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

    console.log("Proxy request starting for URL:", videoUrl);
    console.log("With headers:", JSON.stringify(headers));

    const response = await fetch(videoUrl, { headers });

    console.log("Proxy received response with status:", response.status);
    console.log("Response headers:", JSON.stringify(response.headers));

    if (!response.ok) {
        return {
            statusCode: response.status,
            body: `Failed to fetch video stream: ${response.statusText}`
        };
    }

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
    console.error("Proxy function failed:", error);
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`
    };
  }
};
