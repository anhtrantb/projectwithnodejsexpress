//-------------------------------khai báo------------------------------------------
var controller= require('./controllers/user.controller')
const express = require('express'); // Require module express vào project
var cookieParser = require('cookie-parser')//cookie
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
app.get('/users/cookie',(req,res)=>{
	res.cookie('name','test');
	res.send('hello world');
})
// //----------------------------phương thức post-------------------------------
app.get('/users/create',(req,res)=>{
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
//----------------------hiển thị chi tiết --------------
app.get('/users/:id',(req,res)=>{
	var id = parseInt(req.params.id);
	var user = db.get('users').find({id:id}).value();
	res.render('users/view',{
		user:user
	})
})
//---------------------------lắng nghe ở cổng, chạy trên terminal ------------
app.listen(port, function(){
    console.log('Your app running on port '+ port);
})  