var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.session.user_name) {
        res.render('index', { title: 'Game of Life - Home', home: true, user_name: req.session.user_name });
    } else {
        res.render('index', { title: 'Game of Life - Home', home: true });
    }
});

module.exports = router;
