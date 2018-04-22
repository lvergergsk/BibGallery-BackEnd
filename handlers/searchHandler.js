const async = require('async');
const connectionFactory = require('../db/connection');
// const searchDB = require('../db/searchDB');
const pattern = require('../db/searchQuery');

const dummyConnect = function(cb) {
    let conn = {
        execute: (query, params, callback) => {
            callback('This is a dummy connection.');
        }
    };
    cb(null, conn);
};

const doQuery = function(body, conn, cb) {
    let queryBuilder;
    try {
        queryBuilder = pattern.searchType[body.type].begin;
    } catch (err) {
        if (err instanceof TypeError) {
            cb(new Error('No search type specified.'));
        } else {
            throw err;
        }
        return;
    }
    if (body.params['person']) {
        queryBuilder += pattern.nameTab.append;
    }
    queryBuilder += pattern.whereClause;
    let pubTypeCount = 0;
    let pubTypePredicate = pattern.pubType.begin;
    for (const pubType of body.pubtype) {
        if (pattern.pubType[pubType]) {
            pubTypeCount++;
            pubTypePredicate += pattern.pubType[pubType];
        }
    }
    pubTypePredicate += pattern.pubType.end;
    if (pubTypeCount != 0) {
        queryBuilder += pubTypePredicate;
    }
    if (body.params['yearbegin']) {
        queryBuilder += pattern.year.begin;
    }
    if (body.params['yearend']) {
        queryBuilder += pattern.year.end;
    }
    if (body.params['person']) {
        queryBuilder += pattern.nameTab.person;
    }
    if (body.params['title']) {
        queryBuilder += pattern.title;
    }
    if (body['order']) {
        if (pattern.order.type[body['order']['type']]) {
            queryBuilder += pattern.order.type[body['order']['type']];
            if (pattern.order.order[body['order']['order']]) {
                queryBuilder += pattern.order.order[body['order']['order']];
            }
        }
    }
    queryBuilder += pattern.searchType[body.type].end;
    console.log(queryBuilder);
    console.log(body.params);
    conn.execute(queryBuilder, body.params, cb);
};

// const refine = {
//     PERSON_ID: function(row) {
//         row["PERSON_ID"]
//     }
// };

/**
 *
 */
const reQuery = function(type, results, conn, cb) {
    console.log(query.refine[type]);
    async.map(results, refine, (err, results) => {
        if (err) {
            console.error(err.message);
        }
        connectionFactory.dorelease(conn);
        cb(results);
    });
};

const searchHandler = function(req, res) {
    // if (!req.user) res.sendStatus(401);
    async.waterfall(
        [
            connectionFactory.doconnect,
            // dummyConnect,
            async.apply(doQuery, req.body)
            // reQuery
        ],
        (err, qResult) => {
            if (err) {
                console.log(err);
                res.status(400).json({
                    success: false
                });
            } else {
                res.status(200).json({
                    success: true,
                    result: qResult
                });
            }
        }
    );
};

module.exports = searchHandler;
