const express = require('express');
const sopRouter = express.Router();

const {
  createSOP,
  getSOPbyFilter,
  getAllSOPs,
  getSOPById,
  updateSOP,
  deleteSOP,
} = require('../controllers/sopController');
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware.js');


sopRouter.post('/',protect,upload.single('voiceNote'), createSOP);   
sopRouter.post('/filter',getSOPbyFilter);  
sopRouter.get('/', protect,getAllSOPs);      
sopRouter.get('/:id', getSOPById);   
sopRouter.put('/:id',upload.single('voiceNote'), updateSOP);    
sopRouter.delete('/:id', deleteSOP); 

module.exports = sopRouter;
