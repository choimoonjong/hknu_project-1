const fetch = require("node-fetch");

export const handler = async (event) => {
  const region = event.queryStringParameters.region;
  const serviceKey = process.env.API_KEY;   // 노출 금지된 키

  // 약국 정보 API
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
