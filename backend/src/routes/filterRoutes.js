const express = require('express');
const router = express.Router();
const { filterNotes } = require('../controllers/filterController');

router.get('/notes', filterNotes);

module.exports = router;
