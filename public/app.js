//-------------------------------------------------------------
// 전역
//-------------------------------------------------------------
let map;
let markers = [];
let pharmacyData = [];

// 시도별 기준 좌표
const REGION_CENTER = {
    서울: [37.5665, 126.9780],
    부산: [35.1796, 129.0756],
    대구: [35.8714, 128.6014],
    인천: [37.4563, 126.7052],
    광주: [35.1595, 126.8526],
    대전: [36.3504, 127.3845],
    울산: [35.5384, 129.3114],
    세종: [36.4800, 127.2890],
    경기: [37.4363, 127.5508],
    강원: [37.8228, 128.1555],
    충북: [36.8, 127.7],
    충남: [36.5184, 126.8],
    전북: [35.7175, 127.153],
    전남: [34.8161, 126.463],
    경북: [36.4919, 128.8889],
    경남: [35.4606, 128.2132],
    제주: [33.4996, 126.5312]
};

//-------------------------------------------------------------
window.onload = () => {
    initMap();
    initEvents();
};

//-------------------------------------------------------------
function initMap() {
    map = new kakao.maps.Map(document.getElementById("map"), {
        center: new kakao.maps.LatLng(36.5, 127.9),
        level: 12
    });

    map.addControl(
        new kakao.maps.ZoomControl(),
        kakao.maps.ControlPosition.RIGHT
    );
}

//-------------------------------------------------------------
function initEvents() {
    document.getElementById("searchBtn")
        .addEventListener("click", handleSearch);
}

//-------------------------------------------------------------
// XML Parsing
//-------------------------------------------------------------
function parsePharmacyXML(xmlString) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, "application/xml");

    const items = Array.from(xml.getElementsByTagName("item"));

    return items.map(item => ({
        name: getText(item, "dutyName"),
        addr: getText(item, "dutyAddr"),
        tel: getText(item, "dutyTel1"),
        lat: parseFloat(getText(item, "wgs84Lat")),
        lng: parseFloat(getText(item, "wgs84Lon"))
    })).filter(p => !isNaN(p.lat) && !isNaN(p.lng));
}

function getText(parent, tag) {
    const el = parent.getElementsByTagName(tag)[0];
    return el ? el.textContent.trim() : "";
}

//-------------------------------------------------------------
// 검색
//-------------------------------------------------------------
async function handleSearch() {
    const region = document.getElementById("regionSelect").value;

    // 지도 중심 이동
    const [cLat, cLng] = REGION_CENTER[region];
    map.setCenter(new kakao.maps.LatLng(cLat, cLng));
    map.setLevel(9);

    document.getElementById("pharmacyCount").innerText = "로드 중…";

    // 약국 데이터 요청
    const response = await fetch(`/api/pharmacy?region=${region}`);
    const xmlData = await response.text();

    pharmacyData = parsePharmacyXML(xmlData);
    document.getElementById("pharmacyCount").innerText = pharmacyData.length;

    renderMarkers(pharmacyData);
    renderList(pharmacyData);

    // 날씨
    await loadWeather(region);
}

//-------------------------------------------------------------
function renderMarkers(list) {
    clearMarkers();

    list.forEach(p => {
        const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(p.lat, p.lng),
            map: map
        });

        const info = new kakao.maps.InfoWindow({
            content: `
                <div style="padding:5px;font-size:13px">
                    <b>${p.name}</b><br>${p.addr}<br>${p.tel}
                </div>
            `
        });

        kakao.maps.event.addListener(marker, "click", () => info.open(map, marker));

        markers.push(marker);
    });
}

function clearMarkers() {
    markers.forEach(m => m.setMap(null));
    markers = [];
}

//-------------------------------------------------------------
function renderList(list) {
    const ul = document.getElementById("pharmacyList");
    ul.innerHTML = "";

    list.forEach(p => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.innerHTML = `<b>${p.name}</b><br>${p.addr}<br>${p.tel}`;
        ul.appendChild(li);
    });
}

//-------------------------------------------------------------
// 날씨
//-------------------------------------------------------------
async function loadWeather(region) {
    const [lat, lng] = REGION_CENTER[region];
    const { nx, ny } = latLonToGrid(lat, lng);

    const date = formatDate(new Date());
    const time = "0500";

    const res = await fetch(`/api/weather?base_date=${date}&base_time=${time}&nx=${nx}&ny=${ny}`);
    const json = await res.json();

    if (!json.response || !json.response.body) {
        document.getElementById("weatherStatus").innerText = "실패";
        return;
    }

    const items = json.response.body.items.item;
    const getVal = cat => items.find(x => x.category === cat)?.obsrValue ?? "-";

    document.getElementById("weatherStatus").innerText = "완료";
    document.getElementById("weatherTemp").innerText = getVal("T1H");
    document.getElementById("weatherHum").innerText = getVal("REH");
    document.getElementById("weatherRain").innerText = getVal("RN1");
    document.getElementById("weatherWind").innerText = getVal("WSD");
}

// 날짜 YYYYMMDD
function formatDate(d) {
    return `${d.getFullYear()}${("0" + (d.getMonth() + 1)).slice(-2)}${("0" + d.getDate()).slice(-2)}`;
}

// 기상청 좌표 변환 함수
function latLonToGrid(lat, lon) {
    const RE = 6371.00877;
    const GRID = 5.0;
    const SLAT1 = 30.0;
    const SLAT2 = 60.0;
    const OLON = 126.0;
    const OLAT = 38.0;
    const XO = 43;
    const YO = 136;

    const DEGRAD = Math.PI / 180.0;
    const re = RE / GRID;
    const slat1 = SLAT1 * DEGRAD;
    const slat2 = SLAT2 * DEGRAD;
    const olon = OLON * DEGRAD;
    const olat = OLAT * DEGRAD;

    let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
             Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);

    let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;

    let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = (re * sf) / Math.pow(ro, sn);

    let ra = Math.tan(Math.PI * 0.25 + lat * 0.5 * DEGRAD);
    ra = (re * sf) / Math.pow(ra, sn);

    let theta = lon * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;

    const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

    return { nx: x, ny: y };
}
