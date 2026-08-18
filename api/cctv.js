export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { minX, maxX, minY, maxY } = req.query;
  const apiKey = '70de7a2cb4cc411d8de01825666b6e80';

  if (!minX || !maxX || !minY || !maxY) {
    return res.status(400).json({ error: 'minX, maxX, minY, maxY 파라미터가 필요합니다' });
  }

  // 공식 문서 기준: type은 ex(고속도로) 또는 its(국도)
  const types = ['ex', 'its'];
  const bases = [
    'https://openapi.its.go.kr/cctvInfo',
    'https://openapi.its.go.kr:9443/cctvInfo',
    'http://openapi.its.go.kr/cctvInfo'
  ];

  for (const type of types) {
    for (const base of bases) {
      const params = new URLSearchParams({
        apiKey,
        type,
        cctvType: '1',
        minX,
        maxX,
        minY,
        maxY,
        getType: 'json'
      });

      const url = `\( {base}? \){params.toString()}`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/xml, */*'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const text = await response.text();

        // 유효한 데이터가 왔을 때만 반환
        if (text && text.length > 30 && !text.includes('<html') && !text.includes('error')) {
          res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
          return res.status(200).send(text);
        }
      } catch (err) {
        // 타임아웃이나 네트워크 오류 → 다음 조합 시도
        continue;
      }
    }
  }

  return res.status(502).json({ 
    error: '국토부 ITS API 응답 없음',
    message: 'API 서버가 응답하지 않거나 일시적 장애일 수 있습니다.'
  });
}