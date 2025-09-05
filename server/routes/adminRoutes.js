// server/routes/adminRoutes.js
import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import approvalRoutes from './admin/approval.js'; // ✅ ESM 방식으로 수정

const router = express.Router();

// ✅ /api/admin/approval 경로 등록
router.use('/approval', approvalRoutes);

// ✅ 기본 관리자 확인용 API
router.get('/', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: '관리자만 접근 가능' });
  }
  res.json({ msg: '✅ 관리자 전용 데이터입니다!' });
});

export default router;
