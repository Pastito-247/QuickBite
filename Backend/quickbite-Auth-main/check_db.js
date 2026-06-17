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

  connection.query('SELECT id, first_name, email, LENGTH(profile_image) as img_len FROM users', (error, results) => {
    if (error) {
      console.error('Error querying users:', error);
    } else {
      console.log('Users in DB:');
      console.table(results);
    }
    connection.end();
  });
});
