var connection = require('../connection/connect');

var registerConstructor = function (req, res) {
    console.log("registerConstructor 접근");

    if(!req.user){
        console.log('사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        res.end();
    } else{
        var context = {};
        console.log('사용자 인증된 상태임.');
        console.log('회원정보 로드.');
        console.dir(req.user);
        context.login_success = true;
        context.user = req.user;
        context.output = undefined;

        var database = req.app.get('database');

        // 데이터베이스 객체가 초기화 된 경우
        if (database.db){
            database.UserModel.findRole1(req.user.id, function(err, results){
                if (err) {
                    console.error('시행사 글 조회 에러 : ' + err.stack);

                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                    res.write('<script>alert("시행사 글 조회 중 에러 발생" + err.stack);' +
                        'location.href="/"</script>');
                    res.end();
                    return;
                }
                if (results) {
                    if (results.length != 0){
                        context.userpost = results;
                        res.render('registerConstructor.ejs', context);
                    } else {
                        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                        res.write('<script>alert("진행중인 펀딩이 없습니다.");' +
                            'location.href="/"</script>');
                        res.end();
                    }

                }
            });
        } else {
            res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
            res.write('<script>alert("데이터베이스 연결 실패" + err.stack);' +
                'location.href="/"</script>');
            res.end();
        }
    }
};

var register = function (req, res) {
    console.log("registerConstructor/register 접근");

    if(!req.user){
        console.log('사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        res.end();
    } else{
        var context = {}
        console.log('사용자 인증된 상태임.');
        console.log('회원정보 로드.');
        console.dir(req.user);
        context.login_success = true;
        context.user = req.user;
        context.output = undefined;

        var encryptionWallet = req.user.accountEncryption;
        var walletPassword = req.user.wallet_password;

        var buildingConstructor = req.body.buildingConstructor;
        var contractAddress = req.body.smartContractAddress;

        console.log("buildingConstructor : ", buildingConstructor);
        console.log("contractAddress: ", contractAddress);
        // 시행사인지 체크
        //accountEncryption, password, contractAddress, buildingConstructor, callback
        connection.registerBuildingCostructor(encryptionWallet, walletPassword, contractAddress, buildingConstructor, function (result) {
            if(result) {
                var database = require('../database/database');

                if(database.db){
                    database.PostModel.findByAddress(contractAddress, function(err, result_title){
                        if (err) {
                            console.error('findByAddress 에러 : ' + err.stack);

                            res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                            res.write('<script>alert("post 로드 중 에러 발생" + err.stack);' +
                                'location.href="/"</script>');
                            res.end();
                            return;
                        }
                        if (result_title){
                            if (result_title.length == 1){
                                var postTitle = result_title[0].title;
                                var postRole = 3;
                                database.UserModel.adding_role(buildingConstructor, postTitle, contractAddress, postRole, function (err, result) {
                                    if (err) {
                                        console.error('adding_role 에러 : ' + err.stack);

                                        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                        res.write('<script>alert("user 로드 중 에러 발생" + err.stack);' +
                                            'location.href="/"</script>');
                                        res.end();
                                        return;
                                    }
                                    if (result) {
                                        database.PostModel.add_constructor(buildingConstructor, contractAddress, function (err, result){
                                            if (err) {
                                                console.error('add_constructor 에러 : ' + err.stack);

                                                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                                res.write('<script>alert("시행사 등록중 에러 발생" + err.stack);' +
                                                    'location.href="/"</script>');
                                                res.end();
                                                return;
                                            }
                                            if (result){
                                                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                                res.write('<script>alert("등록 성공");' +
                                                    'location.href="/"</script>');
                                                res.end();
                                            }
                                        });

                                    }
                                });
                            } else{
                                console.error('findByAddress 에러 : ' + err.stack);

                                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                res.write('<script>alert("post 로드 중 에러 발생" + err.stack);' +
                                    'location.href="/"</script>');
                                res.end();
                                return;
                            }
                        }
                    })
                } else {
                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                    res.write('<script>alert("데이터베이스 연결 실패" + err.stack);' +
                        'location.href="/"</script>');
                    res.end();
                }

            }else{
                // error
            }
        });
    }
}

module.exports.registerConstructor = registerConstructor;
module.exports.register = register;