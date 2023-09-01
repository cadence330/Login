const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {

  res.setHeader('Content-Type', 'text/html'); 

  let path = './index.html';

  fs.readFile(path, (err, data) => {
    if (err) {
      console.log(err);
      res.end();
    } else {
      //short way to write res.write(data) - sends the data to the client
      res.end(data)
    }
  })
})

server.listen(3000, 'localhost', () => {
  console.log('listening on port 3000');
})