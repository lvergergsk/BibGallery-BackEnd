const async = require('async');
const connectionFactory = require('../db/connection');
// const searchDB = require('../db/searchDB');
const pattern = require('../db/searchQuery');
const _ = require('lodash');

const dummyConnect = function(cb) {
    let conn = {
        execute: (query, params, callback) => {
            callback('This is a dummy connection.');
        }
    };
    cb(null, conn);
};

const handles = {
    connectDB: connectionFactory.doconnect,

    getPubType: [
        'getBody',
        function(body, cb) {
            let pubTypeList = _.uniq(
                _.map(_.filter(body.pubtype, x => pattern.pubType[x]), x => x.toUpperCase())
            );
            if (pubTypeList.length == 0) {
                pubTypeList = pattern.allPubType;
            }
            cb(null, pubTypeList);
        }
    ],

    buildQuery: [
        'getBody',
        'getPubType',
        function(body, pubTypeList, cb) {
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
            if (body.params['journal']) {
                queryBuilder += pattern.articleTab.append;
            }
            if (body.params['proceedingid']) {
                queryBuilder += pattern.inproceedingTab.append;
            }
            if (body.params['bookid']) {
                queryBuilder += pattern.incollectionTab.append;
            }
            queryBuilder += pattern.whereClause;
            if (pubTypeList.length < 5) {
                queryBuilder += pattern.pubType.begin;
                queryBuilder.concat(..._.map(pubTypeList, x => pattern.pubType[x]));
                queryBuilder += pattern.pubType.end;
            }
            if (body.params['person']) {
                queryBuilder += pattern.nameTab.person;
            }
            if (body.params['journal']) {
                queryBuilder += pattern.articleTab.article;
            }
            if (body.params['proceedingid']) {
                queryBuilder += pattern.inproceedingTab.inproceeding;
            }
            if (body.params['bookid']) {
                queryBuilder += pattern.incollectionTab.incollection;
            }
            if (body.params['yearbegin']) {
                queryBuilder += pattern.year.begin;
            }
            if (body.params['yearend']) {
                queryBuilder += pattern.year.end;
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
            cb(null, queryBuilder, body.params);
        }
    ],

    findPerson: [
        'buildQuery',
        'connectDB',
        function([queryBuilder, params], conn, cb) {
            console.log(queryBuilder + pattern.refine.author);
            conn.execute(queryBuilder + pattern.refine.author, params, (err, perResult) => {
                if (err) {
                    cb(err);
                } else {
                    cb(null, perResult['rows']);
                }
            });
        }
    ],

    refinePerson: [
        'findPerson',
        function(people, cb) {
            async.groupBy(
                people,
                (x, c) => c(null, x['RN']),
                (error, result) =>
                    async.mapValues(
                        result,
                        (v, k, callback) => async.map(v, (x, c) => c(null, x['AUTHOR']), callback),
                        cb
                    )
            );
        }
    ],

    doQuery: [
        'buildQuery',
        'getPubType',
        'connectDB',
        function([queryBuilder, params], pubTypeList, conn, cb) {
            const refine = function(pubType, callback) {
                console.log(
                    queryBuilder +
                        pattern.refine.pubbegin +
                        pubType.toUpperCase() +
                        pattern.refine.pubend
                );
                conn.execute(
                    queryBuilder +
                        pattern.refine.pubbegin +
                        pubType.toUpperCase() +
                        pattern.refine.pubend,
                    params,
                    (err, result) => {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, result['rows']);
                        }
                    }
                );
            };
            async.map(pubTypeList, refine, (err, results) => {
                cb(err, _.flatten(results));
            });
        }
    ],

    combineResult: [
        'refinePerson',
        'doQuery',
        function(people, pubs, cb) {
            async.map(
                pubs,
                (x, c) => {
                    x['AUTHOR'] = people[x['RN']];
                    c(null, x);
                },
                cb
            );
        }
    ],

    disconnectDB: [
        'combineResult',
        'connectDB',
        function(result, conn, cb) {
            connectionFactory.dorelease(conn);
            cb(null, result);
        }
    ]
};

const searchHandler = function(req, res) {
    // if (!req.user) res.sendStatus(401);
    handles.getBody = cb => cb(null, req.body);
    async.autoInject(handles, (err, qResult) => {
        if (err) {
            console.log(err);
            res.status(400).json({
                success: false
            });
        } else {
            res.status(200).json({
                success: true,
                result: qResult.disconnectDB
            });
        }
    });
};

module.exports = searchHandler;
