module.exports = {
    searchType: {
        pub: {
            begin: `SELECT MAIN.* FROM "YOULYU".PUBLICATION MAIN`,
        },
        per: {
            begin: `SELECT MAIN.* FROM "YOULYU".PERSON MAIN`,
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
        person: `AND(REGEXP_LIKE(NAME.PERSON_NAME,:person,'i'))AND(PUBLISH.PERSON_ID=NAME.PERSON_ID)AND(MAIN.PUBLICATION_ID=PUBLISH.PUBLICATION_ID)`
    },
    personTab: {
        append: `,"YOULYU".PUBLISH`,
        person: `AND(PERSON_ID=:personid)AND(MAIN.PUBLICATION_ID=PUBLISH.PUBLICATION_ID)`
    },
    articleTab: {
        append: `,"YOULYU".ARTICLE ART`,
        article: `AND(ART.JOURNAL=:journal)AND(ART.PUBLICATION_ID=MAIN.PUBLICATION_ID)`
    },
    inproceedingTab: {
        append: `,"YOULYU".INPROCEEDING INP`,
        inproceeding: `AND(INP.CROSSREF=:proceedingid)AND(INP.PUBLICATION_ID=MAIN.PUBLICATION_ID)`
    },
    incollection: {
        append: `,"YOULYU".INCOLLECTION INC`,
        incollection: `AND(INP.CROSSREF=:bookid)AND(INC.PUBLICATION_ID=MAIN.PUBLICATION_ID)`
    },
    year: {
        begin: `AND(YEAR>=:yearbegin)`,
        end: `AND(YEAR<=:yearend)`
    },
    order: {
        type: {
            year: `ORDER BY MAIN.YEAR`
        },
        order: {
            ASC: ` ASC`,
            DESC: ` DESC`
        }
    },
    count: {
        begin: `SELECT COUNT(*) AS CNT FROM(`,
        end: `)WHERE :offset+:num<>0`
    },
    page: {
        begin: `(SELECT RN,PUBLICATION_ID AS ID,TITLE,YEAR,TYPE FROM(SELECT ROWNUM AS RN,MAIN.* FROM(`,
        perbegin: `SELECT RN,PERSON_ID AS ID,AFFILIATION,HOMEPAGE FROM(SELECT ROWNUM AS RN,MAIN.* FROM(`,
        end: `)MAIN WHERE ROWNUM <= :offset+:num)WHERE RN > :offset)MAIN`
    },
    refine: {
        pub:{
            begin: `SELECT * FROM "YOULYU".`,
            mid: ` PUB,`,
            end: ` WHERE MAIN.ID = PUB.PUBLICATION_ID`,
        },
        citation: {
            begin: `SELECT RN, PUB.TITLE AS CITATION FROM`,
            end: `,"YOULYU".CITE, "YOULYU".PUBLICATION PUB\
        WHERE MAIN.ID = CITE.PREDECESSOR AND CITE.SUCCESSOR = PUB.PUBLICATION_ID
        GROUP BY MAIN.RN, PUB.TITLE`
        },
        author: {
            begin: `SELECT RN,MIN(NAME.PERSON_NAME) AS AUTHOR, PER.PERSON_ID AS AUTHOR_ID FROM`,
            end: `,"YOULYU".PUBLISH PUB,"YOULYU".PERSON PER,"YOULYU".NAME\
        WHERE MAIN.ID = PUB.PUBLICATION_ID AND PUB.PERSON_ID = PER.PERSON_ID AND PER.PERSON_ID = NAME.PERSON_ID
        GROUP BY MAIN.RN, PER.PERSON_ID`
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
