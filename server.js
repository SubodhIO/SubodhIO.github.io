var express=require('express');
var path = require('path');
var app = express();


app.use(express.static(path.join(__dirname,'public')));

app.listen('4000',function(){
    console.log('GridX server started @4000');
});

app.get('/',function(req,res){
    res.redirect('views/graph.html');
});