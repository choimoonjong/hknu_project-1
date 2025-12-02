const fetch = require("node-fetch");

export const handler = async (event) => {
  const region = event.queryStringParameters.region;
  const serviceKey = process.env.API_KEY;

  const url =
    `http://apis.data.go.kr/B551182/pharmacyInfoService/getParmacyBasisList` +
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
