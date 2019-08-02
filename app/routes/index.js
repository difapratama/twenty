var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var path = require("path");

//connecting to the db
let db = new sqlite3.Database(path.join(__dirname, 'data.db'));

router.get('/', function (req, res, next) {
  const page = req.query.page || 1;
  const limit = 5;
  const offset = (page - 1) * limit;
  const url = req.url == '/' ? '/?page=1' : req.url
  let params = [];
  let isFilter = false;

  if (req.query.checkid && req.query.formid) {
    params.push(`id=${req.query.formid}`);
    isFilter = true;
  }
  if (req.query.checkstring && req.query.formstring) {
    params.push(`string like '%${req.query.formstring}%'`);
    isFilter = true;
  }
  if (req.query.checkinteger && req.query.forminteger) {
    params.push(`integer=${req.query.forminteger}`);
    isFilter = true;
  }
  if (req.query.checkfloat && req.query.formfloat) {
    params.push(`float=${req.query.formfloat}`);
    isFilter = true;
  }
  if (req.query.checkdate && req.query.startdate && req.query.enddate) {
    params.push(`date between '${req.query.startdate}' and '${req.query.enddate}'`);
    isFilter = true;
  }
  if (req.query.checkboolean && req.query.boolean) {
    params.push(`boolean=${req.query.boolean}`);
    isFilter = true;
  }
  let sql = `select count(*) as total from data`;
  if (isFilter) {
    sql += ` where ${params.join(' and ')}`
  }
  db.all(sql, (err, count) => {
    const total = count[0].total;
    const pages = Math.ceil(total / limit);
    sql = `select * from data`;
    if (isFilter) {
      sql += ` where ${params.join(' and ')}`
    }
    sql += ` limit ${limit} offset ${offset}`;
    db.all(sql, (err, rows) => {
      res.render('index', {
        rows,
        page,
        pages,
        query: req.query,
        url
      });
    });
  });
});

router.get('/add', function (req, res, next) {
  res.render('add');
});

// Menerima data input from user
router.post('/add', function (req, res) {
  //console.log(req.body); { string: 'bambang', integer: '25', float: '165', date: '2011-08-19', boolean: 'false' }

  // inserting data
  let sql = `INSERT INTO data(string, integer, float, date, boolean) VALUES ('${req.body.string}', ${parseInt(req.body.integer)}, ${parseFloat(req.body.float)},'${req.body.date}', ${(req.body.boolean == 'true' ? 1 : 0)})`;

  db.run(sql, function (err) {
    if (err) {
      console.log(err.message);
    }
    console.log(`data berhasil di masukkan`);
  });
  res.redirect('/');
})

//edit data
router.get('/edit/:id', function (req, res, next) {
  let id = req.params.id;

  db.all('SELECT * FROM data where id = $id', {
    $id: id
  }, (err, rows) => {
    res.render('edit', {
      item: rows[0],
      id: id
    })
  })
});

router.post('/edit/:id', function (req, res) {
  let id = req.params.id;
  let sql = `UPDATE data SET string = '${req.body.string}', integer = ${parseInt(req.body.integer)}, float = ${parseFloat(req.body.float)}, date = '${req.body.date}', boolean = ${(req.body.boolean == 'true' ? 1 : 0)} where id = ?`;

  db.run(sql, id, function (err) {
    if (err) {
      console.log(err.message);
    }
    console.log(`data berhasil di masukkan`);
  });
  res.redirect('/');
})

// delete data
router.get('/delete/:id', function (req, res, next) {
  let id = req.params.id;
  db.run('DELETE FROM data where id = $id', {
    $id: id
  }, (err, rows) => {
    if (err) {
      console.log(err.message);
    }
    console.log(`data berhasil di masukkan`);
  });
  res.redirect('/');
});

module.exports = router;