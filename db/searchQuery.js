module.exports = {
    searchType: {
        pub: {
            begin: `(SELECT RN,PUBLICATION_ID AS ID,TITLE,YEAR,TYPE FROM(SELECT ROWNUM AS RN,PUB.* FROM "YOULYU".PUBLICATION PUB`,
            end: `)WHERE RN BETWEEN :offset+1 AND :offset+:num)`
        }
    },
    whereClause: ` WHERE(1=1)`,
    title: `AND(REGEXP_LIKE(TITLE,:title,'i'))`,
    pubType: {
        begin: `AND((0=1)`,
        article: `OR(TYPE='article')`,
        inproceeding: `OR(TYPE='inproceeding')`,
        incollection: `OR(TYPE='incollection')`,
        proceeding: `OR(TYPE='proceeding')`,
        book: `OR(TYPE='book')`,
        end: `)`
    },
    nameTab: {
        append: `,"YOULYU".NAME NAME`,
        person: `AND(REGEXP_LIKE(NAME.PERSON_NAME,:person||,'i'))`
    },
    year: {
        begin: `AND(YEAR>=:yearbegin)`,
        end: `AND(YEAR<=:yearend)`
    },
    order: {
        type: {
            year: `ORDER BY PUB.YEAR`
        },
        order: {
            ASC: ` ASC`,
            DESC: ` DESC`
        }
    },
    notImp: {
        qPubTitleByKeyword: [
            `SELECT PUB.* FROM "YOULYU".PUBLICATION PUB, (SELECT ROWNUM AS RN, PUBLICATION_ID AS ID  FROM "YOULYU".PUBLICATION\
    WHERE TITLE LIKE '%'||:keyword||'%' AND ROWNUM <= :offset + :num) PID \
    WHERE PID.RN > :offset AND PID.ID = PUB.PUBLICATION_ID`,
            `SELECT PUB.* FROM "YOULYU".PUBLICATION PUB, (SELECT ROWNUM AS RN, PUBLICATION_ID AS ID  FROM "YOULYU".PUBLICATION\
    WHERE TITLE LIKE '%'||:keyword||'%' AND ROWNUM <= :offset + :num) PID \
    WHERE PID.RN > :offset AND PID.ID = PUB.PUBLICATION_ID`
        ],
        // `SELECT PUB.* FROM "YOULYU".PUBLICATION PUB, (SELECT ROWNUM as RN, PUBLICATION_ID as ID FROM "YOULYU".PUBLICATION WHERE TITLE LIKE '%'||:keyword||'%' AND ROWNUM <= :offset + :num) PID;`,
        // WHERE PID.RN > :offset AND PID.ID = PUB.PUBLICATION_ID;`,
        qPerNameByKeyword: `SELECT PER.* FROM "YOULYU".PERSON PER, (SELECT ROWNUM AS RN, PERSON_ID AS ID FROM "YOULYU".NAME\
    WHERE PERSON_NAME LIKE '%'||:keyword||'%' AND ROWNUM <= :offset + :num) PID \
    WHERE PID.RN > :offset AND PID.ID = PER.PERSON_ID`
    }
};
