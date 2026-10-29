const express = require('express');
const Food = require('../models/Food');

const router = express.Router();

// Kiem tra du lieu dau vao khi them / cap nhat mon an
function validateFoodData(data, isUpdate = false) {
  const errors = [];
  if (!isUpdate || data.foodId !== undefined) {
    if (!data.foodId || String(data.foodId).trim() === '') {
      errors.push('foodId la bat buoc');
    }
  }
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || String(data.name).trim() === '') {
      errors.push('name la bat buoc');
    }
  }
  if (!isUpdate || data.category !== undefined) {
    if (!data.category || String(data.category).trim() === '') {
      errors.push('category la bat buoc');
    }
  }
  if (data.price !== undefined) {
    if (data.price === '' || Number.isNaN(Number(data.price)) || Number(data.price) < 0) {
      errors.push('price phai la so >= 0');
    }
  } else if (!isUpdate) {
    errors.push('price la bat buoc');
  }
  if (data.quantity !== undefined) {
    if (data.quantity === '' || Number.isNaN(Number(data.quantity)) || Number(data.quantity) < 0) {
      errors.push('quantity phai la so >= 0');
    }
  }
  return errors;
}

// Bo dau tieng Viet de tim kiem khong can go dau:
// go "pho" van tim ra "Pho bo", go "com ga" van tim ra "Com ga"
function boDauTiengViet(chuoi) {
  return String(chuoi || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

// GET /api/foods  va  GET /api/foods?search=pho
// Tim kiem theo ten mon, loai mon an hoac am thuc / vung mien
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const foods = await Food.find({}).sort({ createdAt: -1 });
    if (!search || search.trim() === '') {
      return res.status(200).json(foods);
    }
    const tuKhoa = boDauTiengViet(search.trim());
    const ketQua = foods.filter((food) =>
      [food.name, food.category, food.cuisine, food.foodId].some((truong) =>
        boDauTiengViet(truong).includes(tuKhoa)
      )
    );
    return res.status(200).json(ketQua);
  } catch (error) {
    return res.status(500).json({ message: 'Loi may chu khi lay danh sach mon an', error: error.message });
  }
});

// GET /api/foods/:id - Xem thong tin mot mon an
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Khong tim thay mon an' });
    }
    return res.status(200).json(food);
  } catch (error) {
    // id khong dung dinh dang ObjectId thi coi nhu khong tim thay
    return res.status(404).json({ message: 'Khong tim thay mon an' });
  }
});

// POST /api/foods - Them mon an moi (khong cho phep trung foodId)
router.post('/', async (req, res) => {
  try {
    const errors = validateFoodData(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Du lieu khong hop le', errors });
    }

    const existing = await Food.findOne({ foodId: req.body.foodId });
    if (existing) {
      return res.status(409).json({ message: `Ma mon an foodId "${req.body.foodId}" da ton tai` });
    }

    const food = await Food.create(req.body);
    return res.status(201).json(food);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Ma mon an foodId da ton tai' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Du lieu khong hop le', error: error.message });
    }
    return res.status(500).json({ message: 'Loi may chu khi them mon an', error: error.message });
  }
});

// PUT /api/foods/:id - Cap nhat thong tin mon an
router.put('/:id', async (req, res) => {
  try {
    const errors = validateFoodData(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Du lieu khong hop le', errors });
    }

    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Khong tim thay mon an' });
    }

    // Neu doi foodId thi kiem tra trung voi mon khac
    if (req.body.foodId && req.body.foodId !== food.foodId) {
      const existing = await Food.findOne({ foodId: req.body.foodId });
      if (existing) {
        return res.status(409).json({ message: `Ma mon an foodId "${req.body.foodId}" da ton tai` });
      }
    }

    const updated = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Ma mon an foodId da ton tai' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Du lieu khong hop le', error: error.message });
    }
    return res.status(404).json({ message: 'Khong tim thay mon an' });
  }
});

// DELETE /api/foods/:id - Xoa mon an
router.delete('/:id', async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Khong tim thay mon an' });
    }
    return res.status(200).json({ message: 'Da xoa mon an thanh cong', deletedFood: food });
  } catch (error) {
    return res.status(404).json({ message: 'Khong tim thay mon an' });
  }
});

module.exports = router;
