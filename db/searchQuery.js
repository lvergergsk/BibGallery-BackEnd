module.exports = {
    searchType: {
        pub: {
            begin: `WITH TOTTAB AS (SELECT RN,PUBLICATION_ID AS ID,TITLE,YEAR,TYPE FROM(SELECT ROWNUM AS RN,PUB.* FROM(SELECT PUB.* FROM "YOULYU".PUBLICATION PUB`,
            end: `)PUB)WHERE RN BETWEEN :offset+1 AND :offset+:num)`
        }
    },
    whereClause: ` WHERE(1=1)`,
    title: `AND(REGEXP_LIKE(TITLE,:title,'i'))`,
    allPubType: ['article', 'inproceeding', 'incollection', 'proceeding', 'book'],
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
        append: `,"YOULYU".PUBLISH,"YOULYU".NAME`,
        person: `AND(REGEXP_LIKE(NAME.PERSON_NAME,:person,'i')AND(PUBLISH.PERSON_ID=NAME.PERSON_ID)AND(PUB.PUBLICATION_ID=PUBLISH.PUBLICATION_ID))`
    },
    articleTab: {
        append: `,"YOULYU".ARTICLE ART`,
        article: `AND(ART.JOURNAL=:journal)AND(ART.PUBLICATION_ID=PUB.PUBLICATION_ID)`
    },
    inproceedingTab: {
        append: `,"YOULYU".INPROCEEDING INP`,
        inproceeding: `AND(INP.CROSSREF=:proceedingid)AND(INP.PUBLICATION_ID=PUB.PUBLICATION_ID)`
    },
    incollection: {
        append: `,"YOULYU".INCOLLECTION INC`,
        incollection: `AND(INP.CROSSREF=:collectionid)AND(INC.PUBLICATION_ID=PUB.PUBLICATION_ID)`
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
    refine: {
        pubbegin: `SELECT * FROM TOTTAB, "YOULYU".`,
        pubend: ` PUB WHERE TOTTAB.ID = PUB.PUBLICATION_ID`,
        author: `SELECT RN,MIN(NAM.PERSON_NAME) AS AUTHOR FROM TOTTAB,"YOULYU".PUBLISH PUB,"YOULYU".PERSON PER,"YOULYU".NAME NAM\
        WHERE TOTTAB.ID = PUB.PUBLICATION_ID AND PUB.PERSON_ID = PER.PERSON_ID AND PER.PERSON_ID = NAM.PERSON_ID
        GROUP BY TOTTAB.RN, PER.PERSON_ID`
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
