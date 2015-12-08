var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Stock = mongoose.model('Stock');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.put('/getStock/:name', function (req, res, next) {
    Stock.findOne({name: req.params.name}, function(err, response) {
        if(!response) {
            var stock = new Stock();
                    
            stock.name = req.params.name;
            for(var i = 0; i < req.body.dataset.data.length; i++) {
                var dataSet = {
                    date: req.body.dataset.data[i][0],
                    open: req.body.dataset.data[i][1],
                    close: req.body.dataset.data[i][4]
                }
                stock.data.push(dataSet);
            }
            stock.save();
            res.json(stock);
        } else {
            res.json();
        }
    })
});

router.get('/listStock/', function(req, res, next) {
    Stock.find(function(err, response) {
        if(err) {console.log(err); return;};
        
        res.json(response);
    })
})

router.delete('/delete/:name', function (req, res, next) {
    Stock.remove({name: req.params.name}, function(err, response) {
        if(err) {console.log(err); return;};
        
        res.json();
    })
})

module.exports = router;
