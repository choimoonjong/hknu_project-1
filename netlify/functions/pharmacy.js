const fetch = require("node-fetch");

exports.handler = async (event) => {
  const region = event.queryStringParameters.region;

  // 일반키 그대로 받아옴
  const rawKey = process.env.API_KEY;

  // 강제로 디코딩 (Encoding → Decoding 변환)
  const serviceKey = decodeURIComponent(rawKey);

  const url =
    `https://apis.data.go.kr/B551182/pharmacyInfoService/getParmacyBasisList?` +
    `serviceKey=${serviceKey}&Q0=${encodeURIComponent(region)}&numOfRows=5000&pageNo=1`;

  try {
    const response = await fetch(url);
    const xml = await response.text();

    return {
      statusCode: 200,
      body: xml
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: err.message
    };
  }
};
