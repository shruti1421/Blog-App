const express = require('express');
const { model } = require('mongoose');
const route = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const axios = require('axios');

const services = require('../services/render');

//Home Page
route.get('/',ensureAuthenticated,(req,res)=>{
    axios.get('http://localhost:3000/users/posts/',)
    .then(function(posts){
        res.render('index',{
            
            posts: posts.data, 
            name: req.user.name,
            id: req.user._id  
        })
    })
    .catch(err=>{
        res.send(err);
    })
   
});

route.get('/add_posts',ensureAuthenticated,services.add_posts);

route.get('/update_post', services.update_post);

route.get('/see_post',services.see_post);


module.exports = route;