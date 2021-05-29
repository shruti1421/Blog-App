const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { ensureAuthenticated } = require('../config/auth');
const passport = require('passport');
const User = require('../model/User');
const Post = require('../model/Post');
const axios = require('axios');

//Login Page
router.get('/login',(req,res)=>res.render('login'));

//Register Page
router.get('/register',(req,res)=>res.render('register'));

//Get all posts of a user
router.get(`/posts/:_id`,(req,res)=>{
    try {
        Post.find({user:req.params._id})
    .then(post=>{
            res.send(post);
       }
    )
    .catch(err=>{
        res.status(500).send({message: err.message || "Error occured while retrieving  post information"});
    })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

//Get all posts
router.get('/posts/',(req,res)=>{
    try {
        Post.find()
    .then(post=>{
            res.send(post);
       }
    )
    .catch(err=>{
        res.status(500).send({message: err.message || "Error occured while retrieving  post information"});
    })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

//Get a single post
router.get(`/post/:_id`,(req,res)=>{
     const id = req.params._id;

     Post.findById(id)
         .then(data=>{
             if(!data){
                 res.status(404).send({message: "Not found post with id"+id})
             }else{
                 res.send(data);
             }
         })
})

//Update Post
router.post('/update/:_id',(req,res)=>{
    if(!req.body){
        return res.status(400)
                  .send({message: "Data to update can't be empty"});  
    }

    const id = req.params._id; //url parameter

    Post.findByIdAndUpdate(id, req.body, {useFindAndModify: false})
                             .then(data=>{
                                if(!data){
                                    res.status(404).send({message: `Cannot update user with ${id}. Maybe user not found!`});
                                }else{
                                    req.flash('success_msg','Your post was updated successfully');
                                    res.redirect('/users/dashboard');
                                }
                             })
                             .catch(err=>{
                                 res.status(500).send({message: "Error Update user information"});
                             })
})


//Dashboard Page
router.get('/dashboard',ensureAuthenticated,(req,res)=>{
    axios.get(`http://localhost:3000/users/posts/${req.user._id}`,)
    .then(function(posts){
        res.render('dashboard',{
            
            posts: posts.data, 
            name: req.user.name,
            id: req.user._id  
        })
    })
    .catch(err=>{
        res.send(err);
    })
   
});


//Post a new post
router.post('/posts',ensureAuthenticated,async (req,res)=>{
    
    const {title,content} = req.body;

    let errors = [];


    //Check required fields
    if(!title || !content){
       errors.push({msg: 'Please fill all fields' });
    }

    try{
        const newPost = new Post({
            user: req.user.id,
            name: req.user.name,
            title,
            content
        });

        //save post in the database
        newPost.save(newPost).then(data=>{
            req.flash('success_msg','Your post was added successfully');
            res.redirect('/add_posts')
        }).catch(err=>{
        res.status(500).send({
            message: err.message||'Some error occured while creating a create operation'
        })
    });
    }catch{

    }
})



//Delete a post
router.get(`/delete/:_id`,ensureAuthenticated, (req,res)=>{
    const id = req.params._id;

    Post.findByIdAndDelete(id)
        .then(data=>{
            if(!data)
            {
                req.flash('success_msg','Post was added successfully');
                res.status(404).send({message: "Cannot delete user"});
            }else{
                    req.flash('success_msg','Your post was deleted successfully');
                             res.redirect('/users/dashboard');
            }
        })
        .catch(err=>{
            res.status(500).send({
                message: "Could not delete User with id =" +id
            })
        })
})



//Register Handle
router.post('/register',(req,res)=>{
    const { name,email,password,password2 } = req.body;
    let errors = [];


    //Check required fields
    if(!name || !email || !password || !password2){
       errors.push({msg: 'Please fill all fields' });
    }
    //Check password match
    if(password != password2)
    {
        errors.push({msg:'Passwords do not match'});
    }
    //Check pass length
    if(password.length <6)
    {
        errors.push({msg: 'Password should be atleast 6 characters'})
    }

    if(errors.length >0)
    {
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        })
    }else{
        //Validation pass
        User.findOne({email:email})
        .then(user => {
            if(user){
                //User exists
                errors.push({msg: 'Email is already registered'});
                res.render('register',{
                  errors,
                  name,
                  email,
                  password,
                  password2
                })
           }else{
               const newUser = new User({
                   name,
                   email,
                   password
               });

               //Hash Password
               bcrypt.genSalt(10, (err,salt)=>{
                   bcrypt.hash(newUser.password,salt,(err,hash)=>{
                       if(err) throw err;

                       //Set password to hash
                       newUser.password=hash;

                       newUser.save()
                         .then(user=>{
                             req.flash('success_msg','You are now registered and can log in');
                             res.redirect('/users/login');
                         })
                         .catch(err=>console.log(err));

                   })
               })
           }
        });
    }
});

//Login Handle
router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect: '/users/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req,res,next);
 });

 //Logout Handle
router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success_msg','You are logged out');
    res.redirect('/users/login');
 });


module.exports = router;
