const express = require('express');
const router = express.Router();


const urlController = require('../controller/urlcontroller')


router.post('/url/shorten', urlController.createUrl)
router.get('/:urlCode', urlController.getUrl)


module.exports = router;