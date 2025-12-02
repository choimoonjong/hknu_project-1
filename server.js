// server.js
const express = require("express");
const path = require("path");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// ---------- 약국 API 키 ----------
const PHARM_KEY = "5fd6833c558c5b60909e71a8d875164f37e93e23e9a72bf147d98dacec0ef95f";   // Decoding된 일반 인증키

// ---------- 기상청 API 키 ----------
const WEATHER_KEY = "5fd6833c558c5b60909e71a8d875164f37e93e23e9a72bf147d98dacec0ef95f"; // 기상청도 동일한 키 사용

// ---------- 정적 파일 제공 ----------
app.use(express.static(path.join(__dirname, "public")));


// =====================================================================
// 1) 전국 약국 정보 프록시 (시도 기준 전체 약국 조회)
// =====================================================================
app.get("/api/pharmacy", async (req, res) => {
    const region = req.query.region; // ex. "서울"
    if (!region) {
        return res.status(400).json({ error: "region parameter required" });
    }

    try {
        const endpoint =
            "https://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyListInfoInqire";

        const numRows = 100; 
        let pageNo = 1;
        let xmlParts = [];

        while (true) {
            const url =
                `${endpoint}?serviceKey=${PHARM_KEY}` +
                `&Q0=${encodeURIComponent(region)}` + // ex) 서울
                `&Q1=` + 
                `&pageNo=${pageNo}` +
                `&numOfRows=${numRows}` +
                `&ORD=NAME`;

            const response = await axios.get(url, { responseType: "text" });

            const xml = response.data;
            const count = (xml.match(/<item>/g) || []).length;

            if (count === 0) break;

            xmlParts.push(xml);
            pageNo++;

            if (pageNo > 30) break; // 안전장치
        }

        res.send(xmlParts.join("\n"));

    } catch (err) {
        console.error("Pharmacy Proxy Error:", err);
        res.status(500).json({ error: "Pharmacy API Error" });
    }
});


// =====================================================================
// 2) 기상청 초단기실황 API 프록시
// =====================================================================
app.get("/api/weather", async (req, res) => {
    const { base_date, base_time, nx, ny } = req.query;

    const url =
        `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst` +
        `?serviceKey=${WEATHER_KEY}` +
        `&dataType=JSON` +
        `&pageNo=1&numOfRows=60` +
        `&base_date=${base_date}` +
        `&base_time=${base_time}` +
        `&nx=${nx}` +
        `&ny=${ny}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (err) {
        console.error("Weather Proxy Error:", err);
        res.status(500).json({ error: "Weather API Error" });
    }
});


// =====================================================================
// 기본 index.html
// =====================================================================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =====================================================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
