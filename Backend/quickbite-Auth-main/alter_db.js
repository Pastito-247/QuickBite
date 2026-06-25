const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'quickbite_auth'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL.');

  const sql = "ALTER TABLE users MODIFY COLUMN profile_image LONGTEXT;";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error('Error altering table:', error);
    } else {
      console.log('Successfully altered profile_image to LONGTEXT.');
    }
    connection.end();
  });
});
