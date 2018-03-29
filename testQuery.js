const oracledb = require('oracledb');
const dbConfig = require('./db/dbConfig');

const testQuery =
    "SELECT * FROM\n" +
    "  (SELECT * FROM PAPER\n" +
    "   ORDER BY YEAR DESC)\n" +
    "WHERE ROWNUM <= :num";

const testQueryExec = function (param, connection, callback) {
    connection.execute(testQuery, [5], function (err, result) {
        if (err) {
            console.error(err.message);
            return;
        }
        callback(result.rows);
    });
};

exports.testQueryHandler=function(req, res) {
    oracledb.getConnection(dbConfig.credential, function(err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }

        var param = req.query || req.params;
        testQueryExec(param, connection, function(rows) {
            res.send(rows);
        });
        connection.close();
    });
};