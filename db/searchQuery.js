module.exports = {
    searchType: {
        pub: {
            begin: `SELECT MAIN.* FROM "YOULYU".PUBLICATION MAIN`
        },
        per: {
            begin: `SELECT MAIN.PERSON_ID FROM "YOULYU".PUBLISH MAIN`,
            end: `GROUP BY MAIN.PERSON_ID`
        }
    },
    whereClause: ` WHERE(1=1)`,
    title: {
        pub: `AND(REGEXP_LIKE(TITLE,:title,'i'))`,
        per: `AND(REGEXP_LIKE(PUB.TITLE,:title,'i'))AND(PUB.PUBLICATION_ID=MAIN.PUBLICATION_ID)`
    },
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
    publicationID: {
        join: `AND(MAIN.PUBLICATION_ID=:publicationid)`
    },
    personID: {
        pub: `AND(PUBLISH.PERSON_ID=:personid)AND(MAIN.PUBLICATION_ID=PUBLISH.PUBLICATION_ID)`,
        per: `AND(MAIN.PERSON_ID=:personid)`
    },
    publicationTab: {
        append: `,"YOULYU".PUBLICATION PUB`,
        join: {
            publication: `AND(PUBLISH.PUBLICATION_ID=PUB.PUBLICATION_ID)`
        }
    },
    nameTab: {
        append: {
            pub: `,"YOULYU".PUBLISH,"YOULYU".NAME`,
            per: `,"YOULYU".NAME`
        },
        join: {
            pub: `AND(REGEXP_LIKE(NAME.PERSON_NAME,:person,'i'))AND(PUBLISH.PERSON_ID=NAME.PERSON_ID)AND(MAIN.PUBLICATION_ID=PUBLISH.PUBLICATION_ID)`,
            per: `AND(REGEXP_LIKE(NAME.PERSON_NAME,:person,'i'))AND(NAME.PERSON_ID=PUBLISH.PERSON_ID)`
        }
    },
    publishTab: {
        append: `,"YOULYU".PUBLISH`,
        join: {
            publication: `AND(MAIN.PUBLICATION_ID=PUB.PUBLICATION_ID)`
        }
    },
    articleTab: {
        append: `,"YOULYU".ARTICLE ART`,
        article: `AND(ART.JOURNAL=:journal)AND(ART.PUBLICATION_ID=MAIN.PUBLICATION_ID)`
    },
    inproceedingTab: {
        append: `,"YOULYU".INPROCEEDING INP`,
        inproceeding: `AND(((INP.CROSSREF=:proceedingid)AND(INP.PUBLICATION_ID=MAIN.PUBLICATION_ID))OR(MAIN.PUBLICATION_ID=:proceedingid))`
    },
    incollectionTab: {
        append: `,"YOULYU".INCOLLECTION INC`,
        incollection: `AND(((INC.CROSSREF=:bookid)AND(INC.PUBLICATION_ID=MAIN.PUBLICATION_ID))OR(MAIN.PUBLICATION_ID=:bookid))`
    },
    year: {
        begin: `AND(YEAR>=:yearbegin)`,
        end: `AND(YEAR<=:yearend)`
    },
    order: {
        type: {
            year: {
                pub: `ORDER BY MAIN.YEAR`,
                per: ` ORDER BY MAX(PUB.YEAR)`
            }
        },
        order: {
            ASC: ` ASC`,
            DESC: ` DESC`
        }
    },
    count: {
        begin: `SELECT COUNT(*) AS CNT FROM(`,
        end: `)WHERE :offset+:num<>0` // need :offset and :num to match params.
    },
    page: {
        begin: {
            pub: `(SELECT RN,PUBLICATION_ID AS ID,TITLE,YEAR,TYPE FROM(SELECT ROWNUM AS RN,MAIN.* FROM(`,
            per: `(SELECT RN,PERSON_ID AS ID FROM(SELECT ROWNUM AS RN,MAIN.* FROM(`
        },
        end: `)MAIN WHERE ROWNUM<=:offset+:num)WHERE RN>:offset)MAIN`
    },
    refine: {
        pub: {
            article: `SELECT MAIN.*,JOURNAL,PAGES,VOLUME,EE,URL FROM "YOULYU".ARTICLE PUB,`,
            inproceeding: `SELECT MAIN.*,BOOKTITLE,EE,URL,CROSSREF FROM "YOULYU".INPROCEEDING PUB,`,
            incollection: `SELECT MAIN.*,BOOKTITLE,PAGES,EE,URL,CROSSREF FROM "YOULYU".INCOLLECTION PUB,`,
            proceeding: `SELECT MAIN.*,BOOKTITLE,VOLUME,PUBLISHER,ISBN,EE,URL FROM "YOULYU".PROCEEDING PUB,`,
            book: `SELECT MAIN.*,PAGES,VOLUME,SERIES,PUBLISHER,ISBN,EE,URL FROM "YOULYU".BOOK PUB,`,
            person: `SELECT MAIN.*,AFFILIATION,HOMEPAGE FROM "YOULYU".PERSON PER,`,
            begin: `SELECT * FROM "YOULYU".`,
            mid: ` PUB,`,
            end: {
                pub: ` WHERE MAIN.ID=PUB.PUBLICATION_ID`,
                per: ` WHERE MAIN.ID=PER.PERSON_ID`
            }
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
    }
};
