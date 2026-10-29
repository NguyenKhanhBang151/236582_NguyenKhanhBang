const mongoose = require('mongoose');

// Schema mon an theo dung yeu cau de thi Cau 2 + Cau 3
const foodSchema = new mongoose.Schema(
  {
    foodId: {
      type: String,
      required: [true, 'Vui long nhap ma mon an (foodId)'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Vui long nhap ten mon an'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Vui long nhap loai mon an'],
      trim: true,
    },
    cuisine: {
      type: String,
      default: '',
      trim: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: [true, 'Vui long nhap gia ban'],
      min: [0, 'Gia ban khong duoc am'],
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'So luong khong duoc am'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

// Chi dinh ro collection "foods" theo quy uoc de thi
module.exports = mongoose.model('Food', foodSchema, 'foods');
