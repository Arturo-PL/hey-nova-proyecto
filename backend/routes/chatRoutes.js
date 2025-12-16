const express = require('express');
const router = express.Router();
const { proteger } = require('../middleware/authentication'); 

const { 
    accessChat,       
    obtenerChatsUsuario,    
    allMessages,      
    sendMessage      
} = require('../controllers/messageController'); 

router.route('/')
    .post(proteger, accessChat) 
    .get(proteger, obtenerChatsUsuario); 

router.route('/messages/:chatId').get(proteger, allMessages); 

router.route('/messages').post(proteger, sendMessage); 

module.exports = router;