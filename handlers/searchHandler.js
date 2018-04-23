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
            let pubTypeList = _.uniq(_.filter(body.pubtype, x => pattern.pubType[x]));
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
            if (body.params['personid']) {
                queryBuilder += pattern.personTab.append;
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
                queryBuilder += "".concat(..._.map(pubTypeList, x => pattern.pubType[x]));
                queryBuilder += pattern.pubType.end;
            }
            if (body.params['person']) {
                queryBuilder += pattern.nameTab.person;
            }
            if (body.params['personid']) {
                queryBuilder += pattern.personTab.person;
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
            // queryBuilder += pattern.searchType[body.type];
            cb(null, queryBuilder, body.params);
        }
    ],

    countRecord: ['buildQuery', 'connectDB', function([queryBuilder, params], conn, cb){
        // console.log(pattern.count.begin+queryBuilder+pattern.count.end);
        conn.execute(pattern.count.begin+queryBuilder+pattern.count.end, params, (err, result) => {
            if (err) {
                cb(err);
            } else {
                console.log(result['rows']);
                cb(null, result['rows'][0]["CNT"]);
            }
        });
    }],

    findPerson: [
        'buildQuery',
        'connectDB',
        function([queryBuilder, params], conn, cb) {
            // console.log(pattern.refine.author.begin + pattern.page.begin + queryBuilder + pattern.page.end + pattern.refine.author.end);
            conn.execute(pattern.refine.author.begin + pattern.page.begin + queryBuilder + pattern.page.end + pattern.refine.author.end, params, (err, result) => {
                if (err) {
                    cb(err);
                } else {
                    console.log("Person Found.");
                    cb(null, result['rows']);
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
                        (v, k, callback) => async.map(v, (x, c) => c(null, {NAME: x['AUTHOR'], ID: x["AUTHOR_ID"]}), callback),
                        cb
                    )
            );
        }
    ],

    findCitation: [
        'buildQuery',
        function([queryBuilder, params], cb) {
            connectionFactory.doconnect(
                (error, conn) => {
                    if(error)
                        cb(error);
                    else {
                        conn.execute(pattern.refine.citation.begin + pattern.page.begin + queryBuilder + pattern.page.end + pattern.refine.citation.end, params, (err, result) => {
                            connectionFactory.dorelease(conn);
                            if (err) {
                                cb(err);
                            } else {
                                console.log("Citation Found.");
                                cb(null, result['rows']);
                            }
                        });
                    }
                });
        }
    ],

    refineCitation: [
        'findCitation',
        function(citations, cb) {
            async.groupBy(
                citations,
                (x, c) => c(null, x['RN']),
                (error, result) =>
                    async.mapValues(
                        result,
                        (v, k, callback) => async.map(v, (x, c) => c(null, x['CITATION']), callback),
                        cb
                    )
            );
        }
    ],

    doQuery: [
        'buildQuery',
        'getPubType',
        function([queryBuilder, params], pubTypeList, cb) {
            const refine = function(pubType, callback) {
                // console.log(
                //         pattern.refine.pub.begin +
                //         pubType.toUpperCase() +
                //         pattern.refine.pub.mid +
                //         pattern.page.begin +
                //         queryBuilder +
                //         pattern.page.end +
                //         pattern.refine.pub.end
                // );
                connectionFactory.doconnect(
                    (error, conn) => {
                        if(error) {
                            cb(error);
                        } else {
                            conn.execute(
                                pattern.refine.pub.begin +
                                    pubType.toUpperCase() +
                                    pattern.refine.pub.mid +
                                    pattern.page.begin +
                                    queryBuilder +
                                    pattern.page.end +
                                    pattern.refine.pub.end,
                                params,
                                (err, result) => {
                                    connectionFactory.dorelease(conn);
                                    if (err) {
                                        callback(err);
                                    } else {
                                        console.log("PubType Found");
                                        callback(null, result['rows']);
                                    }
                                }
                            );
                        }
                    });
            };
            async.map(pubTypeList, refine, (err, results) => {
                cb(err, _.flatten(results));
            });
        }
    ],

    combineResult: [
        'refinePerson',
        'refineCitation',
        'doQuery',
        function(people, citations, pubs, cb) {
            async.map(
                pubs,
                (x, c) => {
                    x['AUTHOR'] = people[x['RN']];
                    x['CITATION'] = citations[x['RN']];
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
                count: qResult.countRecord,
                result: qResult.disconnectDB
            });
        }
    });
};

module.exports = searchHandler;
