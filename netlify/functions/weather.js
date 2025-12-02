const fetch = require("node-fetch");

exports.handler = async (event) => {
  const p = event.queryStringParameters;

  const rawKey = process.env.API_KEY;
  const serviceKey = decodeURIComponent(rawKey);

  const url =
    `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?` +
    `serviceKey=${serviceKey}&dataType=JSON&base_date=${p.base_date}` +
    `&base_time=${p.base_time}&nx=${p.nx}&ny=${p.ny}`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(json)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
