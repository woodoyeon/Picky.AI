import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ msg: '토큰 없음' });

  try {
    const decoded = jwt.verify(token, 'secret-key'); // 실제 서비스에선 .env에서 관리
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: '토큰 유효하지 않음' });
  }
}
