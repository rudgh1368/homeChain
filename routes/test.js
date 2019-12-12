var test = function (req,res) {

    var message = "Asd"

    res.render('test.ejs', {message : message});
}

module.exports.test = test;