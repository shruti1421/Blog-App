const { default: axios } = require("axios");

exports.add_posts = (req,res) => {
    res.render('add_posts');
}

exports.update_post = (req,res) =>{

    axios.get(`http://localhost:3000/users/post/${req.query._id}`)
         .then(function(postdata){

             res.render('update_post',{post: postdata.data})
         })
         .catch(err=>{
             res.send(err);
         })
}

exports.see_post = (req,res) =>{

    axios.get(`http://localhost:3000/users/post/${req.query._id}`)
         .then(function(postdata){

             res.render('see_post',{post: postdata.data})
         })
         .catch(err=>{
             res.send(err);
         })
}

