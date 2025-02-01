const express = require('express');
const { registerUser, loginUser, updateUser, deleteUser, getAllUser } = require('../controllers/user');
const router = express.Router();

router.post('/signup', registerUser);
router.post('/signin', loginUser);
router.put('/users/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/', getAllUser)

module.exports = router;
