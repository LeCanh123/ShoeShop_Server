const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


// Định nghĩa schema cho collection
const Product = new mongoose.Schema({
    name: String,
    image:String,
    price: Number,
    actualprice:Number,
  });


// Kết nối với cơ sở dữ liệu MongoDB
mongoose.connect('mongodb+srv://1:1@cluster0.hmjl0q5.mongodb.net/Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


//add product
router.post('/', (req, res) => {
    const Product2 = mongoose.model('Product', Product);
    console.log("req.body",req.body);
    Product2.find()
      .then((products) => {
        let productExists = false;
  
        products.forEach(product => {
          if (product.name == req.body.name) {
            productExists = true;
          }
        });
  
        if (productExists) {
          return res.status(201).send({
            status: false,
            message: "Tên Sản phẩm đã tồn tại"
          });
        }else{
            const newProduct = new Product2({
                name: req.body.name,
                image:req.body.image,
                price: req.body.price,
                actualprice: req.body.actualprice,
              });
        
              newProduct.save()
                .then(() => {
                  res.send({
                    status: true,
                    message: "Thêm sản phẩm thành công"
                  });
                })
                .catch((error) => {
                  res.status(201).send({
                    status: false,
                    message: "Thêm sản phẩm thất bại"
                  });
                });
            // Lưu trữ hash trong cơ sở dữ liệu, ví dụ: user.password = hash;
        

        }

      })
      .catch((error) => {
        res.status(201).send({
          status: false,
          message: "Thêm sản phẩm thất bại"
        });
      });
  });


//tìm sản phẩm
router.get('/', (req, res) => {
    const Product2 = mongoose.model('Product', Product);
    Product2.find()
    .then((product) => {
      console.log("product",product);
      res.send({
        status:true,
        message:"Lấy danh sách sản phẩm thành công",
        product});
    })
    .catch((error) => {
      console.error('Error retrieving product:', error);
      res.status(500).send(
        {
            status:false,
            message:"Lấy danh sách sản phẩm thất bại"
        
        }
      );
    });
});


//sửa user
router.put('/:id', (req, res) => {
    const userId = req.params.id;
  
    // Dữ liệu mới cần cập nhật
    const updatedData = {
      name: req.body.name,
      age: req.body.age,
    };
  
    // Cập nhật tài liệu trong collection
    User.findByIdAndUpdate(userId, updatedData, { new: true })
      .then((updatedUser) => {
        res.send(updatedUser);
      })
      .catch((error) => {
        console.error('Error updating user:', error);
        res.status(500).send('Error updating user');
      });
});


//login đăng nhập
router.post('/login', (req, res) => {
    const User2 = mongoose.model('User', User);

    User2.find()
    .then((users) => {

      let findUser=users.find(user => {
        if (user.username == req.body.username) {
          return true
        }else{
            return false
        }
      });
console.log("findUser",findUser);
      if (findUser.length!=0) {
        bcrypt.compare(req.body.password, findUser.password, (err, result) => {
            if (err) {
              console.error('Error comparing passwords:', err);
              return  res.status(201).send({
                status: false,
                message: "Đăng nhập thất bại"
              });
            } 
          
            if (result) {
                return  res.status(201).send({
                    status: true,
                    message: "Đăng nhập thành công",
                    username:findUser.username,
                    password:findUser.password
                  });
            } else {
                return  res.status(201).send({
                    status: false,
                    message: "Mật khẩu không chính xác"
                  });
            }
          });
      }
    })
    .catch((error) => {
        console.log(error);
      res.status(201).send({
        status: false,
        message: "Đăng nhập thất bại"
      });
    });

});



module.exports = router;