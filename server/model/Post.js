const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name:{
        type: mongoose.Schema.Types.String,
        ref: 'User'
    },
    title:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    }

});

const Post = mongoose.model('Post',PostSchema);

module.exports = Post;