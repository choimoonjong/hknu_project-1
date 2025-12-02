const fetch = require("node-fetch");

exports.handler = async (event) => {
  const region = event.queryStringParameters.region;

  const rawKey = process.env.API_KEY;  // 일반키 그대로
  const serviceKey = decodeURIComponent(rawKey);  // 서버에서 디코딩

  const url =
    `https://apis.data.go.kr/B551182/pharmacyInfoService/getParmacyBasisList` +
    `?serviceKey=${serviceKey}` +
    `&Q0=${encodeURIComponent(region)}` +
    `&Q1=` +   
    `&numOfRows=5000&pageNo=1`;

  try {
    const response = await fetch(url);
    const xml = await response.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
      body: xml
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: err.message
    };
  }
};
