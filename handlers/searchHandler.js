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
    // connectDB: dummyConnect,

    getBodyType: ['getBody', (body, cb) => cb(null, body['type'])],

    getPubType: [
        'getBody',
        function(body, cb) {
            if (body.params['journal']) {
                cb(null, ['article']);
            } else if (body.params['proceedingid']) {
                cb(null, ['proceeding', 'inproceeding']);
            } else if (body.params['bookid']) {
                cb(null, ['book', 'incollection']);
            } else {
                let pubTypeList = _.uniq(_.filter(body.pubtype, x => pattern.pubType[x]));
                if (pubTypeList.length == 0) {
                    pubTypeList = pattern.allPubType;
                }
                cb(null, pubTypeList);
            }
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
                // append name
                queryBuilder += pattern.nameTab.append[body.type];
            } else if (body.type == 'pub' && body.params['personid']) {
                queryBuilder += pattern.publishTab.append;
            }

            // if (body.params['journal']) {
            //     queryBuilder += pattern.articleTab.append;
            // } else if (body.params['proceedingid']) {
            //     queryBuilder += pattern.inproceedingTab.append;
            // } else if (body.params['bookid']) {
            //     queryBuilder += pattern.incollectionTab.append;
            // }

            let needPublication = false;
            if (
                body.type == 'per' &&
                (body.params['yearbegin'] ||
                    body.params['yearend'] ||
                    body.params['title'] ||
                    pubTypeList.length < 5 ||
                    body['order']['type'] == 'year')
            ) {
                needPublication = true;
                queryBuilder += pattern.publicationTab.append;
            }

            queryBuilder += pattern.whereClause;

            if (needPublication) {
                queryBuilder += pattern.publishTab.join.publication;
            }

            if (pubTypeList.length < 5) {
                queryBuilder += pattern.pubType.begin;
                queryBuilder += ''.concat(..._.map(pubTypeList, x => pattern.pubType[x]));
                queryBuilder += pattern.pubType.end;
            }

            if (body.params['personid']) {
                queryBuilder += pattern.personID[body.type];
            } else if (body.params['publicationid']) {
                queryBuilder += pattern.join;
            } else {
                if (body.params['person']) {
                    queryBuilder += pattern.nameTab.join[body.type];
                }
                if (body.params['title']) {
                    queryBuilder += pattern.title[body.type];
                }
            }

            if (body.params['journal']) {
                queryBuilder += pattern.articleTab.article;
            } else if (body.params['proceedingid']) {
                queryBuilder += pattern.inproceedingTab.inproceeding;
            } else if (body.params['bookid']) {
                queryBuilder += pattern.incollectionTab.incollection;
            }

            if (body.params['yearbegin']) {
                queryBuilder += pattern.year.begin;
            }
            if (body.params['yearend']) {
                queryBuilder += pattern.year.end;
            }

            if (body.type == 'per') {
                queryBuilder += pattern.searchType.per.end;
            }

            if (body['order']) {
                // year, num
                // append publish, publication
                if (pattern.order.type[body['order']['type']][body['type']]) {
                    queryBuilder += pattern.order.type[body['order']['type']][body['type']];
                    if (pattern.order.order[body['order']['order']]) {
                        queryBuilder += pattern.order.order[body['order']['order']];
                    }
                }
            }
            // coauthor: append publish
            // queryBuilder += pattern.searchType[body.type];
            cb(null, queryBuilder, body.params);
        }
    ],

    countRecord: [
        'buildQuery',
        'connectDB',
        function([queryBuilder, params], conn, cb) {
            console.log('Count: ' + pattern.count.begin + queryBuilder + pattern.count.end);
            conn.execute(
                pattern.count.begin + queryBuilder + pattern.count.end,
                params,
                (err, result) => {
                    if (err) {
                        cb(err);
                    } else {
                        console.log(result['rows']);
                        cb(null, result['rows'][0]['CNT']);
                    }
                }
            );
        }
    ],

    paginateQuery: [
        'getBodyType',
        'buildQuery',
        function(bodyType, [queryBuilder, params], cb) {
            cb(null, pattern.page.begin[bodyType] + queryBuilder + pattern.page.end, params);
        }
    ],

    doQuery: [
        'getBodyType',
        'paginateQuery',
        'getPubType',
        function(bodyType, [queryBuilder, params], pubTypeList, cb) {
            const refine = function(pubType, callback) {
                console.log(
                    pubType +
                        ': ' +
                        // pattern.refine.pub.begin +
                        // pubType.toUpperCase() +
                        pattern.refine.pub[pubType] +
                        queryBuilder +
                        pattern.refine.pub.end[bodyType]
                );
                connectionFactory.doconnect((error, conn) => {
                    if (error) {
                        callback(error);
                    } else {
                        conn.execute(
                            // pattern.refine.pub.begin +
                            //     pubType.toUpperCase() +
                            //     pattern.refine.pub.mid +
                            pattern.refine.pub[pubType] +
                                queryBuilder +
                                pattern.refine.pub.end[bodyType],
                            params,
                            (err, result) => {
                                connectionFactory.dorelease(conn);
                                if (err) {
                                    callback(err);
                                } else {
                                    console.log(pubType.toUpperCase() + ' Found');
                                    callback(null, result['rows']);
                                }
                            }
                        );
                    }
                });
            };
            if (bodyType == 'per') {
                refine('person', (err, result) => {
                    cb(err, result);
                });
            } else {
                async.map(pubTypeList, refine, (err, results) => {
                    cb(err, _.flatten(results));
                });
            }
        }
    ],

    /**
     * Find opposite entity. Find people for publications, and find publications for people.
     */
    findOpposite: [
        'getBodyType',
        'paginateQuery',
        'connectDB',
        function(bodyType, [queryBuilder, params], conn, cb) {
            // console.log(pattern.refine.author.begin + pattern.page.begin + queryBuilder + pattern.page.end + pattern.refine.author.end);
            conn.execute(
                pattern.opposite.begin[bodyType] + queryBuilder + pattern.opposite.end[bodyType],
                params,
                (err, result) => {
                    if (err) {
                        cb(err);
                    } else {
                        console.log('Opposite entity found.');
                        cb(null, result['rows']);
                    }
                }
            );
        }
    ],

    refineOpposite: [
        'findOpposite',
        function(opposites, cb) {
            async.groupBy(
                opposites,
                (x, c) => c(null, x['RN']),
                (error, result) =>
                    async.mapValues(
                        result,
                        (v, k, callback) =>
                            async.map(
                                v,
                                (x, c) => c(null, { NAME: x['OPPO_NAME'], ID: x['OPPO_ID'] }),
                                callback
                            ),
                        cb
                    )
            );
        }
    ],

    /**
     * Find ego attribute that recognize its citation for publications, and its name for people.
     */
    findEgo: [
        'getBodyType',
        'paginateQuery',
        function(bodyType, [queryBuilder, params], cb) {
            connectionFactory.doconnect((error, conn) => {
                if (error) cb(error);
                else {
                    conn.execute(
                        pattern.ego.begin[bodyType] +
                            queryBuilder +
                            pattern.ego.end[bodyType],
                        params,
                        (err, result) => {
                            connectionFactory.dorelease(conn);
                            if (err) {
                                cb(err);
                            } else {
                                console.log('Ego attribute found.');
                                cb(null, result['rows']);
                            }
                        }
                    );
                }
            });
        }
    ],

    refineEgo: [
        'findEgo',
        function(egos, cb) {
            async.groupBy(
                egos,
                (x, c) => c(null, x['RN']),
                (error, result) =>
                    async.mapValues(
                        result,
                        (v, k, callback) =>
                            async.map(v, (x, c) => c(null, {NAME: x['EGO'], ID: x['EGO_ID']}), callback),
                        cb
                    )
            );
        }
    ],

    /**
     * Find company attribute that recognize its citation for publications, and its name for people.
     */
    findCompany: [
        'getBodyType',
        'paginateQuery',
        'connectDB',
        function(bodyType, [queryBuilder, params], conn, cb) {
            console.log('Company: ' +
                        pattern.company.begin[bodyType] +
                        queryBuilder +
                        pattern.company.end[bodyType]);
            conn.execute(
                pattern.company.begin[bodyType] +
                    queryBuilder +
                    pattern.company.end[bodyType],
                params,
                (err, result) => {
                    if (err) {
                        cb(err);
                    } else {
                        console.log('Company attribute found.');
                        cb(null, result['rows']);
                    }
                }
            );
        }
    ],

    refineCompany: [
        'findCompany',
        function(companies, cb) {
            async.groupBy(
                companies,
                (x, c) => c(null, x['RN']),
                (error, result) =>
                    async.mapValues(
                        result,
                        (v, k, callback) =>
                            async.map(v, (x, c) => c(null, {NAME: x['COMP'], ID: x['COMP_ID']}), callback),
                        cb
                    )
            );
        }
    ],

    combineResult: [
        'getBodyType',
        'refineOpposite',
        'refineEgo',
        'refineCompany',
        'doQuery',
        function(bodyType, opposites, egos, companies, pubs, cb) {
            async.map(
                pubs,
                (x, c) => {
                    x[pattern.opposite.entity[bodyType]] = opposites[x['RN']];
                    x[pattern.ego.attribute[bodyType]] = egos[x['RN']];
                    x[pattern.company.attribute[bodyType]] = companies[x['RN']];
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
