import mysql from "mysql"

const sqlConnection = mysql.createConnection({
    host: 'database-1.cz1lqpid0itw.us-east-1.rds.amazonaws.com',
    port: '3306',
    user: 'admin',
    password: 'prooh.ai',
    database: 'proohdb',
    timeout: '60000'
})

const connectSqlDb = () => {
    sqlConnection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});
}

export {
    connectSqlDb,
    sqlConnection
}