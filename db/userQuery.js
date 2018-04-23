module.exports = {
    register: `INSERT INTO users (USERNAME, HASH, EMAIL) VALUES (:username, :hash,:email)`,
    check: `SELECT HASH FROM YOULYU.USERS WHERE YOULYU.USERS.USERNAME=:username`
};
