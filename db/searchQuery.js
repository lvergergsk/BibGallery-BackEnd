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
            per: `AND(REGEXP_LIKE(NAME.PERSON_NAME,:person,'i'))AND(NAME.PERSON_ID=MAIN.PERSON_ID)`
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
        article: `AND(MAIN.PUBLICATION_ID IN(SELECT PUBLICATION_ID FROM "YOULYU".ARTICLE WHERE JOURNAL=:journal))`
    },
    inproceedingTab: {
        append: `,"YOULYU".INPROCEEDING INP`,
        inproceeding: `AND((MAIN.PUBLICATION_ID IN(SELECT PUBLICATION_ID FROM "YOULYU".INPROCEEDING WHERE CROSSREF=:proceedingid))OR(MAIN.PUBLICATION_ID=:proceedingid))`
    },
    incollectionTab: {
        append: `,"YOULYU".INCOLLECTION INC`,
        incollection: `AND((MAIN.PUBLICATION_ID IN(SELECT PUBLICATION_ID FROM "YOULYU".INCOLLECTION WHERE CROSSREF=:bookid))OR(MAIN.PUBLICATION_ID=:bookid))`
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
        }
    },
    ego: {
        attribute: {
            pub: `CITATION`,
            per: `SYNONYM`
        },
        begin: {
            pub: `SELECT RN,PUB.TITLE AS EGO,PUB.PUBLICATION_ID AS EGO_ID FROM`,
            per: `SELECT RN,NAME.PERSON_NAME AS EGO,NAME.PERSON_ID AS EGO_ID FROM`
        },
        end: {
            pub: `,"YOULYU".CITE,"YOULYU".PUBLICATION PUB WHERE MAIN.ID=CITE.PREDECESSOR AND CITE.SUCCESSOR=PUB.PUBLICATION_ID`,
            per: `,"YOULYU".NAME WHERE MAIN.ID=NAME.PERSON_ID`
        }
    },
    opposite: {
        entity: {
            pub: `AUTHOR`,
            per: `PUBLICATION`
        },
        begin: {
            pub: `SELECT RN,MIN(NAME.PERSON_NAME) AS OPPO_NAME, PER.PERSON_ID AS OPPO_ID FROM`,
            per: `SELECT RN,PUB.TITLE AS OPPO_NAME, PUB.PUBLICATION_ID AS OPPO_ID FROM`
        },
        end: {
            pub: `,"YOULYU".PUBLISH PUB,"YOULYU".PERSON PER,"YOULYU".NAME WHERE(MAIN.ID=PUB.PUBLICATION_ID)AND(PUB.PERSON_ID=PER.PERSON_ID)AND(PER.PERSON_ID=NAME.PERSON_ID)GROUP BY MAIN.RN, PER.PERSON_ID`,
            per: `,"YOULYU".PUBLICATION PUB,"YOULYU".PUBLISH WHERE(MAIN.ID=PUBLISH.PERSON_ID)AND(PUBLISH.PUBLICATION_ID=PUB.PUBLICATION_ID)`
        }
    },
    company: {
        attribute: {
            pub: `CITEDBY`,
            per: `COAUTHOR`
        },
        begin: {
            pub: `SELECT RN,PUB.TITLE AS COMP,PUB.PUBLICATION_ID AS COMP_ID FROM`,
            per: `SELECT RN,MIN(NAME.PERSON_NAME)AS COMP,NAME.PERSON_ID AS COMP_ID FROM`
        },
        end: {
            pub: `,"YOULYU".CITE,"YOULYU".PUBLICATION PUB WHERE MAIN.ID=CITE.SUCCESSOR AND CITE.PREDECESSOR=PUB.PUBLICATION_ID`,
            per: `,"YOULYU".NAME WHERE NAME.PERSON_ID IN(SELECT PERSON_ID FROM "YOULYU".PUBLISH WHERE PUBLISH.PUBLICATION_ID IN(SELECT PUBLISH.PUBLICATION_ID FROM "YOULYU".PUBLISH WHERE PUBLISH.PERSON_ID=MAIN.ID))AND(NAME.PERSON_ID<>MAIN.ID)GROUP BY MAIN.RN,NAME.PERSON_ID`
        }
    }
};
