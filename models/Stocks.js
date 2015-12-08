var mongoose = require('mongoose');

var StockSchema = new mongoose.Schema({
    name: String,
    data: [{
        date: String,
        open: Number,
        close: Number
    }]
});

mongoose.model('Stock', StockSchema);