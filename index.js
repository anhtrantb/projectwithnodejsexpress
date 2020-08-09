const express = require('express');
const app = express();
var port = 3000;

app.get('/',function(request,respond){
	respond.send('hello world');
})
app.listen(port,function(){
	console.log('server is listening on port: '+ port);
})