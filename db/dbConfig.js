module.exports = {
    user: process.env.NODE_ORACLEDB_USER || 'yourUsername',
    password: process.env.NODE_ORACLEDB_PASSWORD || 'yourPassword',
    connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING || 'oracle.cise.ufl.edu/orcl',
    externalAuth: process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
};
