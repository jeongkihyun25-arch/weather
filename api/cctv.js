// api/cctv.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { minX, maxX, minY, maxY, type = 'all', cctvType = '1' } = req.query;
  const apiKey = '70de7a2cb4cc411d8de01825666b6e80';

  if (!minX || !maxX || !minY || !maxY) {
    return res.status(400).json({ error: '경위도 범위 파라미터 누락' });
  }

  const queryParams = new URLSearchParams({
    apiKey,
    type,
    cctvType,
    minX,
    maxX,
    minY,
    maxY,
    getType: 'json'
  }).toString();

  const endpoints = [
    `https://openapi.its.go.kr/cctvInfo?${queryParams}`,
    `http://openapi.its.go.kr/cctvInfo?${queryParams}`,
    `https://openapi.its.go.kr:9443/cctvInfo?${queryParams}`
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*'
        }
      });

      if (!response.ok) continue;

      const data = await response.text();
      // 유효한 데이터가 수신된 경우 반환
      if (data && data.length > 50) {
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
        return res.status(200).send(data);
      }
    } catch (e) {
      // 다음 엔드포인트 시도
    }
  }

  return res.status(502).json({ error: '국토부 ITS API 응답 없음' });
}
