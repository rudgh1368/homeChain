var constructorMypage = function (params, callback) {
    console.log("JSON-RPC constructorMypage 호출");

    var database = global.database;
    var output = {};
    var error = "";

    if (database.db){
        database.UserModel.findRole3(params[0].userID, function(err, results_user) {
            if (err) {
                error = '시행사 글 조회 중 에러 발생 : ' + err.stack;
                output = {
                    context: null,
                    error: error
                }
                callback(null, output);
            }

            if (results_user) {
                var titles = [];
                console.dir(results_user.length);
                if (results_user.length != 0) {
                    for (i = 0; i < results_user.length; i++) {
                        titles[i] = results_user[i].posts.title;
                    }

                    database.PostModel.forMypage(titles, function (err, results_post) {
                        if (err) {
                            error = '시행사 글 조회 중 에러 발생 : ' + err.stack;
                            output = {
                                context: null,
                                error: error
                            }
                            callback(null, output);
                        }

                        if (results_post) {
                            console.dir(results_post);
                            var output = {context : results_post, error : null};
                            callback(null, output);
                        } else {
                            error = '글 조회 실패 : ' + err.stack;
                            output = {
                                context: null,
                                error: error
                            }
                            callback(null, output);
                        }
                    });
                } else {
                    output = {context : 0, error : null};
                    callback(null, output);
                }

            } else {
                output = {context : null, error : "글 조회 실패"};
                callback(null, output);
            }
        })
    }
};

module.exports = constructorMypage;