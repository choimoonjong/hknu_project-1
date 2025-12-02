const fetch = require("node-fetch");

export const handler = async (event) => {
  const p = event.queryStringParameters;
  const serviceKey = process.env.API_KEY;

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
