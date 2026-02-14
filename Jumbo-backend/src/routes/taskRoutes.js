const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary.js');

const { createTask, getTasks, getTasksforEmployees, getTasksbyFilter, getTask, updateTask, deleteTask, markTaskSeen, } = require('../controllers/taskController');

const { protect } = require('../middleware/authMiddleware.js');
router.post('/', protect, upload.single("voiceNote"), createTask);
router.post('/filter', protect, getTasksbyFilter);
router.get('/', protect, getTasks);

router.get('/emp', protect, getTasksforEmployees);

router.get('/:id', getTask);
router.put('/:id', upload.single("voiceNote"), updateTask);
router.delete('/:id', deleteTask);


module.exports = router;
