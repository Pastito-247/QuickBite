const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'quickbite_auth'
});

connection.query("SHOW VARIABLES LIKE 'max_allowed_packet';", (err, results) => {
  if (err) throw err;
  console.log(results);
  connection.end();
});
