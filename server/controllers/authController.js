import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function login(req, res) {
  const { email, password } = req.body;
  

  // 사용자 검증, DB에서 비교 생략
  const token = jwt.sign({ userId: 1, role: 'admin' }, 'secret-key');
  res.json({ token });
}
