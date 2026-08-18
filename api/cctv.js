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

  const targetUrl = `https://openapi.its.go.kr/cctvInfo?apiKey=${apiKey}&type=${type}&cctvType=${cctvType}&minX=${minX}&maxX=${maxX}&minY=${minY}&maxY=${maxY}&getType=json`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    const data = await response.text();
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    return res.status(response.status).send(data);
  } catch (error) {
    return res.status(500).json({ error: 'ITS API 통신 실패', details: error.message });
  }
}

