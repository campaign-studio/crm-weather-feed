# weather-feed (e-mail Gift 2026)

Publica `weather.json` (4 cidades) no GitHub Pages a cada 30 min. A Braze le esse arquivo via Connected Content (1 chamada, com cache).

## Setup (uma vez, na org da Wellhub)
1. Criar o repo (`campaign-studio/crm-weather-feed`, publico) e subir esta pasta (sem o prefixo `weather-feed/`).
2. Settings > Pages > Source: **GitHub Actions**. (Pages gratuito exige repo publico. O JSON so tem clima, nao ha dado sensivel.)
3. Actions > weather-feed > Run workflow (primeira publicacao).
4. URL final: `https://campaign-studio.github.io/crm-weather-feed/weather.json` (ou dominio proprio). Colocar essa URL no bloco Liquid do e-mail (variavel `WEATHER_URL`).
5. Contato no `User-Agent` (a API exige): hiago.branco@gympass.com; trocar por uma caixa do time CRM quando houver.

## Formato
```json
{ "updated_at":"2026-11-04T23:30:00Z", "epoch":1793835000,
  "london": {"c":10,"f":50,"bg":"night","symbol":"cloudy_night","time":"..."}, "rio":{...}, "newyork":{...}, "madrid":{...} }
```
`bg` = `sun | cloud | rain | night` (escolhe a imagem de fundo). O e-mail esconde o bloco se o JSON faltar ou tiver mais de 6 h.

## Observacoes
- Se a MET falhar, o job falha e o Pages segue com o ultimo JSON bom (o e-mail so o ignora se passar de 6 h).
- Schedules do GitHub sao "best effort"; em repo publico sao pausados apos 60 dias sem atividade (em repo privado nao).
- Antes do disparo grande: Test Send + disparo piloto em segmento pequeno.
