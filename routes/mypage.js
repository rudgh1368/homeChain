var mypage = function (req, res) {

    console.log('mypage 모듈 안에 있는 mypage 호출됨.');

    if (!req.user) {
        console.log('mypage: 사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        res.end();
    } else {

        var context = {};

        console.log('mypage: 사용자 인증된 상태임.');
        console.log('회원정보 로드.');
        // console.dir(req.user);
        context.login_success = true;
        context.user = req.user;

        var database = req.app.get('database');

        if (database.db) {
            context.users = req.user.id;
            new Promise(function (resolve, reject) {
                database.UserModel.findRole1(req.user.id, function (err, results_user) {
                    if (err) {
                        console.error('findRole1 에러 : ' + err.stack);

                        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                        res.write('<script>alert("시행사 글 조회 중 에러 발생" + err.stack);' +
                            'location.href="/"</script>');
                        res.end();
                        return;
                    }
                    if (results_user) {
                        var titles = [];
                        if (results_user.length != 0) {
                            for (i = 0; i < results_user.length; i++) {
                                titles[i] = results_user[i].posts.title;
                            }
                            database.PostModel.forMypage(titles, function (err, results_post) {
                                if (err) {
                                    console.error('role1의 forMypage 에러 : ' + err.stack);

                                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                    res.write('<script>alert("시행사 글 조회 중 에러 발생" + err.stack);' +
                                        'location.href="/"</script>');
                                    res.end();
                                    return;
                                }
                                if (results_post) {
                                    context.posts_role1 = results_post;
                                    resolve(context);
                                } else {
                                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                    res.write('<script>alert("글 조회 실패" + err.stack);' +
                                        'location.href="/"</script>');
                                    res.end();
                                }
                            });
                        } else {
                            context.posts_role1 = 0;
                            resolve(context);
                        }
                    } else {
                        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                        res.write('<script>alert("글 조회 실패" + err.stack);' +
                            'location.href="/"</script>');
                        res.end();
                    }
                });
            })
                .then(function (context) {
                    new Promise(function (resolve, reject) {
                        database.UserModel.findRole2(req.user.id, function (err, results_user) {
                            if (err) {
                                console.error('findRole2 에러 : ' + err.stack);

                                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                res.write('<script>alert("시행사 글 조회 중 에러 발생" + err.stack);' +
                                    'location.href="/"</script>');
                                res.end();
                                return;
                            }
                            if (results_user) {
                                var titles = [];
                                if (results_user.length != 0) {
                                    for (i = 0; i < results_user.length; i++) {
                                        titles[i] = results_user[i].posts.title;
                                    }
                                    database.PostModel.forMypage(titles, function (err, results_post) {
                                        if (err) {
                                            console.error('role2의 forMypage 에러 : ' + err.stack);

                                            res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                            res.write('<script>alert("시행사 글 조회 중 에러 발생" + err.stack);' +
                                                'location.href="/"</script>');
                                            res.end();
                                            return;
                                        }
                                        if (results_post) {
                                            context.posts_role2 = results_post;
                                            resolve(context);
                                        } else {
                                            res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                            res.write('<script>alert("글 조회 실패" + err.stack);' +
                                                'location.href="/"</script>');
                                            res.end();
                                        }
                                    });
                                } else {
                                    context.posts_role2 = 0;
                                    resolve(context);
                                }
                            } else {
                                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                res.write('<script>alert("글 조회 실패" + err.stack);' +
                                    'location.href="/"</script>');
                                res.end();
                            }
                        });
                    }).then(function (context) {
                        new Promise(function (resolve, reject) {
                            database.UserModel.findRole3(req.user.id, function (err, results_user) {
                                if (err) {
                                    console.error('findRole3 에러 : ' + err.stack);

                                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                    res.write('<script>alert("시행사 글 조회 중 에러 발생" + err.stack);' +
                                        'location.href="/"</script>');
                                    res.end();
                                    return;
                                }
                                if (results_user) {
                                    var titles = [];
                                    if (results_user.length != 0) {
                                        for (i = 0; i < results_user.length; i++) {
                                            titles[i] = results_user[i].posts.title;
                                        }
                                        database.PostModel.forMypage(titles, function (err, results_post) {
                                            if (err) {
                                                console.error('role3의 forMypage 에러 : ' + err.stack);

                                                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                                res.write('<script>alert("시행사 글 조회 중 에러 발생" + err.stack);' +
                                                    'location.href="/"</script>');
                                                res.end();
                                                return;
                                            }
                                            if (results_post) {
                                                context.posts_role3 = results_post;
                                                resolve(context);
                                            } else {
                                                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                                res.write('<script>alert("글 조회 실패" + err.stack);' +
                                                    'location.href="/"</script>');
                                                res.end();
                                            }
                                        });
                                    } else {
                                        context.posts_role3 = 0;
                                        resolve(context);
                                    }
                                } else {
                                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                    res.write('<script>alert("글 조회 실패" + err.stack);' +
                                        'location.href="/"</script>');
                                    res.end();
                                }
                            });
                        }).then(function (context) {
                            res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                            req.app.render('mypage', context, function (err, html) {
                                if (err) {
                                    console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                    res.write('<script>alert("응답 웹문서 생성 중 에러 발생" + err.stack);' +
                                        'location.href="/"</script>');
                                    res.end();
                                    return;
                                }

                                res.end(html);
                            });
                        });
                    });
                });
        } else {
            res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
            res.write('<script>alert("데이터베이스 연결 실패" + err.stack);' +
                'location.href="/"</script>');
            res.end();
        }
    }
}

module.exports.mypage = mypage;