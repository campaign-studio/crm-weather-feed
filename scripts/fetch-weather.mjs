// Gera site/weather.json com o clima atual de 4 cidades (fonte: MET Norway, https://api.met.no).
// Node 20+, sem dependencias. Se qualquer cidade falhar o job falha e o Pages mantem o ultimo JSON publicado.
import { mkdir, writeFile } from "node:fs/promises";

const UA = process.env.MET_USER_AGENT || "WellhubCRM-WeatherFeed/1.0 github.com/campaign-studio/crm-weather-feed hiago.branco@gympass.com"; // MET exige nome do app + contato
const CITIES = {
  london:  { lat: 51.5072,  lon: -0.1276 },
  rio:     { lat: -22.9068, lon: -43.1729 },
  newyork: { lat: 40.7128,  lon: -74.0060 },
  madrid:  { lat: 40.4168,  lon: -3.7038 },
};

// symbol_code da MET (ex.: "partlycloudy_night", "lightrain", "clearsky_day") -> fundo do e-mail
function pickBg(symbol) {
  if (symbol.endsWith("_night")) return "night";
  const s = symbol.replace(/_(day|night|polartwilight)$/, "");
  if (s === "clearsky" || s === "fair") return "sun";
  if (/(rain|sleet|thunder|drizzle|shower)/.test(s)) return "rain";
  return "cloud"; // nublado, neblina, neve (nao temos asset de neve)
}

async function one(name, { lat, lon }) {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
  let lastErr;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
      if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
      const j = await r.json();
      const t0 = j.properties.timeseries[0];
      const c = t0.data.instant.details.air_temperature;
      const symbol = (t0.data.next_1_hours || t0.data.next_6_hours || t0.data.next_12_hours).summary.symbol_code;
      if (typeof c !== "number") throw new Error(`${name}: sem temperatura`);
      return { c: Math.round(c), f: Math.round(c * 9 / 5 + 32), bg: pickBg(symbol), symbol, time: t0.time };
    } catch (e) { lastErr = e; await new Promise(r => setTimeout(r, 1500 * (i + 1))); }
  }
  throw lastErr;
}

const out = { updated_at: new Date().toISOString(), epoch: Math.floor(Date.now() / 1000), source: "MET Norway (CC BY 4.0)" };
for (const [name, pos] of Object.entries(CITIES)) out[name] = await one(name, pos); // sequencial: educado com a API
await mkdir("site", { recursive: true });
await writeFile("site/weather.json", JSON.stringify(out, null, 2));
await writeFile("site/index.html", "<!doctype html><meta charset=utf-8><title>weather feed</title><p>Weather data: MET Norway. <a href=weather.json>weather.json</a>");
console.log(JSON.stringify(out));
