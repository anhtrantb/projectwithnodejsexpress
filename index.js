//-------------------------------khai báo------------------------------------------
var controller= require('./controllers/user.controller')
const express = require('express'); // Require module express vào project
var cookieParser = require('cookie-parser')//cookie
var md5 = require('md5'); //ma hoa password
const app = express(); // Tạo một app mới
//const shortid = require('shortid');
const port = 3000; // Định nghĩa cổng để chạy ứng dụng NodeJS của bạn trên server
//---------------------------config của pug ---------------------------------------
app.set('views', './views'); // Thư mục views nằm cùng cấp với file app.js
app.set('view engine', 'pug'); // Sử dụng pug làm view engine
//---------------------------config của req.body ----------------------------------
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())//coookie
//--------------------khởi tạo một database đơn giản ---------------
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)
// Set some defaults (required if your JSON file is empty)
db.defaults({users:[]})
  .write()
//-------------------------------main-----------------------------------------------

//--------------------------mảng đối tượng -----------------------------------------
// var users = [
// 	{name: "nam", email: "nam1234@gmail.com"}, 
// 	{name: "minh", email: "minh5678@gmail.com"}
// ];
//----------------phản hồi lại dữ liệu ra màn hình -----------------
app.get('/',controller.index)
//-----------------lấy dữ liệu từ file pug  convert sang html ---------
app.get('/users', function(req, res){
	res.render('users/index',{
		users: db.get('users').value()//lấy dữ liệu từ database 
	});
})
//---------------------------phương thức req.query -------------------------
app.get('/users/search', (req,res) => {
	var name_search = req.query.name // lấy giá trị của key name trong query parameters gửi lên

	var result = db.get('users').value().filter( (user) => {
		// tìm kiếm chuỗi name_search trong user name. 
		// Lưu ý: Chuyển tên về cùng in thường hoặc cùng in hoa để không phân biệt hoa, thường khi tìm kiếm
		return user.name.toLowerCase().indexOf(name_search.toLowerCase()) !== -1
	})

	res.render('users/index', {
		users: result // render lại trang users/index với biến users bây giờ chỉ bao gồm các kết quả phù hợp
	});
})
//-------------------------------cookie-------------------------------------
// app.get('/users/cookie',(req,res)=>{
// 	res.cookie('name','test');
// 	res.send('hello world');
// })
// //----------------------------phương thức post-------------------------------
app.get('/users/create',function(req,res,next){
	if(!req.cookies.name){
		res.redirect('/users/login')
	}
	next();
},
	(req,res)=>{
	//console.log(req.cookies); đọc cookie đã được nhận
	res.render('users/create');  
})

app.post('/users/create', (req, res, next) => {
	// req.body.id= shortid.generate();
	//xác thực người dùng 
	var error=[];  
	if(!req.body.name){
		error.push('khong co name');
	}
	if(!req.body.email){
		error.push('khong co email');
	}
	if(!req.body.age){
		error.push('khong co tuoi');
	}
	if(error.length){
		res.render('users/create',{
			errors:error, //errors sẽ được gọi trong pug 
			values: req.body
		})
		return;
	} 
	next();//chuyển tới hàm tiếp theo 
	},(req, res) => {
		db.get('users').push(req.body).write()//thêm phần tử vào database 
   		res.redirect('/users')//chuyển hướng trở lại trang trước 
	}
  
)
//----------------------login------------------------
app.get('/users/login',(req,res)=>{
	res.render('users/login');
})
app.post('/users/login',(req,res)=>{
	var account = req.body.account;//test
	var password = req.body.password;//1234567890
	var hashpassword = md5(password);//e807f1fcf82d132f9bb018ca6738a19f
	var user = db.get('users').find({account:account}).value();
	if(!user){
		res.render('users/login',{
			error:['user not exist']
		})
		return ;
	}
	if(user.password!==hashpassword){
		res.render('users/login',{
			error:['wrong password']
		})
		return;
	}
	res.cookie('name','test');
	res.redirect('/users/create')

})
//----------------------hiển thị chi tiết --------------
app.get('/users/:id',(req,res)=>{
	var id = parseInt(req.params.id);
	var user = db.get('users').find({id:id}).value();
	res.render('users/view',{
		user:user
	})
})
//--------------------- tạo trang -------------------
app.get('/product',(req,res)=>{
	var page = parseInt(req.query.page) ||1; 
	var nextPage =page+1; 
	var prePage = page-1;
	var perPage = 8;
	var start = (page-1)*perPage; 
	var end = page*perPage;
	res.render('users/product',{
		products: db.get('product').value().slice(start,end),
		prePage:prePage,
		page:page,
		nextPage:nextPage
	})
})
//---------------------------lắng nghe ở cổng, chạy trên terminal ------------
app.listen(port, function(){
    console.log('Your app running on port '+ port);
})  