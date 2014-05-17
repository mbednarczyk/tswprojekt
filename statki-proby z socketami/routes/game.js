var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('game-room', {
    title: 'Game Room'
  });
});



module.exports = router;
