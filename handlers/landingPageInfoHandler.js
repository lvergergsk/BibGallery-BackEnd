const connection = require('../db/connection');
const async = require('async');

const getinfo = function (conn, cb) {
    conn.execute(`
    SELECT * FROM
  (SELECT count(*) AS publication_count
   FROM PUBLICATION),
  (SELECT count(*) AS article_count
   FROM ARTICLE),
  (SELECT count(*) AS incollection_count
   FROM INCOLLECTION),
  (SELECT count(*) AS inproceeding_count
   FROM INPROCEEDING),
  (SELECT count(*) AS book_count
   FROM BOOK),
  (SELECT count(*) AS proceeding_count
   FROM PROCEEDING),
  (SELECT count(*) AS cite_count
   FROM CITE),
  (SELECT count(*) AS publish_count
   FROM PUBLISH),
  (SELECT count(*) AS person_count
   FROM PERSON),
  (SELECT count(*) AS name_count
   FROM NAME)`,
        [],
        {autoCommit: true},
        function (err, result) {
            return cb(err, result, conn);
        }
    );
}

const landingPageInfoHandler = function (req, res) {
    async.waterfall(
        [
            connection.doconnect,
            getinfo,
        ],
        function (err, result, conn) {
            res.status(200).json({
                success: true,
                databaseInfo:result.rows[0],
            });
            if (conn) connection.dorelease(conn);
        }
    );
};
module.exports = landingPageInfoHandler;
