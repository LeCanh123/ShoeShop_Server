const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


// Định nghĩa schema cho collection
const User = new mongoose.Schema({
    username: String,
    password: String,
    cart:Object
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


//đăng kí user
router.post('/', (req, res) => {
    const User2 = mongoose.model('User', User);
    console.log("req.body",req.body);
    User2.find()
      .then((users) => {
        let userExists = false;
  
        users.forEach(user => {
          if (user.username == req.body.username) {
            userExists = true;
          }
        });
  
        if (userExists) {
          return res.status(201).send({
            status: false,
            message: "Tên tài khoản đã tồn tại"
          });
        }
        
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              console.error('Error hashing password:', err);
              return res.status(201).send({
                status: false,
                message: "Đăng kí thất bại"
              });
            }
            const newUser = new User2({
                username: req.body.username,
                password: hash,
              });
        
              newUser.save()
                .then(() => {
                  res.send({
                    status: true,
                    message: "Đăng kí thành công"
                  });
                })
                .catch((error) => {
                  res.status(201).send({
                    status: false,
                    message: "Đăng kí thất bại"
                  });
                });
            // Lưu trữ hash trong cơ sở dữ liệu, ví dụ: user.password = hash;
          });

      })
      .catch((error) => {
        res.status(201).send({
          status: false,
          message: "Đăng kí thất bại"
        });
      });
  });


//tìm user
router.get('/', (req, res) => {
    const User2 = mongoose.model('User', User);
    User2.find()
    .then((users) => {
      console.log("user",users);
      res.send({users});
    })
    .catch((error) => {
      console.error('Error retrieving users:', error);
      res.status(500).send('Error retrieving users');
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


//thêm giỏ hàng
router.post('/addtocart', (req, res) => {
  const User2 = mongoose.model('User', User);
console.log("req.body",req.body);
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
      bcrypt.compare(req.body.password, findUser.password, async (err, result) => {
          if (err) {
            console.error('Error comparing passwords:', err);
            return  res.status(201).send({
              status: false,
              message: "Đăng nhập thất bại"
            });
          } 
        
          if (result) {
            if(findUser.cart==undefined){
              const user = await User2.findOneAndUpdate(
                { _id: findUser._id },
                { $set: {cart:[{...req.body.product,quantity:1}]} },
                { new: true }
              );
              return   res.status(200).send({
                status: true,
                message: "Thêm sản phẩm vào giỏ hàng thành công"
              });
            }else{

              let flag=false;
              let updateCart=findUser.cart.map((item)=>{
                if(item.name==req.body.product.name){
                  flag=true;
                  return {...item,quantity:item.quantity+1}
                }else{
                  return item
                }
              })
              if(flag==false){

                const user = await User2.findOneAndUpdate(
                  { _id: findUser._id },
                  { $set: {cart:[...updateCart,{...req.body.product,quantity:1}]} },
                  { new: true }
                );
                return res.status(200).send({
                  status: true,
                  message: "Thêm sản phẩm vào giỏ hàng thành công"
                });
              }
              const user = await User2.findOneAndUpdate(
                { _id: findUser._id },
                { $set: {cart:[...updateCart]} },
                { new: true }
              );
              return   res.status(200).send({
                status: true,
                message: "Thêm sản phẩm vào giỏ hàng thành công"
              });
            }

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
      message: "Đăng nhập để thêm vào giỏ hàng"
    });
  });

});

//getcart
router.post('/getcart', (req, res) => {
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
                  cart:findUser.cart?findUser.cart:[]
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