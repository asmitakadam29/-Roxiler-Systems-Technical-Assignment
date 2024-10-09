const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  rating: {
    rate: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  dateOfSale: { type: Date, required: true }  // Field for the date of sale
});

module.exports = mongoose.model('Product', productSchema);
