const fetch = require("node-fetch");

exports.handler = async (event) => {
  const region = event.queryStringParameters.region;
  const serviceKey = process.env.API_KEY;

  const url =
    `https://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyListInfoInqire` +
    `?serviceKey=${serviceKey}` +
    `&Q0=${encodeURIComponent(region)}` +
    `&numOfRows=5000&pageNo=1`;

  try {
    const response = await fetch(url);
    const xml = await response.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/xml" },
      body: xml
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: err.message
    };
  }
};
