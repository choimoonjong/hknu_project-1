const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { base_date, base_time, nx, ny } = event.queryStringParameters;
  const serviceKey = process.env.API_KEY;

  const url =
    `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst` +
    `?serviceKey=${serviceKey}` +
    `&dataType=JSON` +
    `&base_date=${base_date}` +
    `&base_time=${base_time}` +
    `&nx=${nx}&ny=${ny}`;

  try {
    const response = await fetch(url);
    const json = await response.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: json
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: err.message
    };
  }
};
