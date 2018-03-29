const getDate = require("./dbTest");
const pooling = require("./pooling");

getDate.getCurDate(function (err, res) {
    console.log(res)
});