const express = require('express');
const app = express();
const usersRouter = require('./Module/User/user');
const productsRouter = require('./Module/Product/product');

const bodyParser = require('body-parser');
const cors = require('cors');



app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const apiRouter = express.Router();
apiRouter.get('/', (req, res) => {
    res.send('API v1 Home');
  });
  
apiRouter.use('/users', usersRouter);
apiRouter.use('/products', productsRouter);

app.use('/api/v1', apiRouter); 


app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(4000, () => {
  console.log('Server started on port 4000');
});