var connection = require('../connection/connect');

var useToken = function (req, res) {
    console.log("useToken 접근");

    if (!req.user) {
        console.log('사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        return res.end();
    }

    var database = req.app.get('database');
    var paramId = req.body.id || req.query.id || req.params.id;

    if (database.db) {
        database.PostModel.load(paramId, function (err, result) {
            if (err) {
                console.log('error occured.');
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("Database Error occured");' +
                    'location.href="/mypage"</script>');
                return res.end();
            }
            if (result) {
                if (result == null) {
                    console.log('잘못된 접근.');
                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                    res.write('<script>alert("잘못된 접근입니다.");' +
                        'location.href="/"</script>');
                    return res.end();
                } else {
                    if (result.writer.id != req.user.id) {
                        console.log('권한이 없음.');
                        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                        res.write('<script>alert("권한이 없습니다.");' +
                            'location.href="/"</script>');
                        return res.end();
                    } else {
                        var context = {};
                        console.log("@@@@@@", result.smart_addr);
                        database.UserModel.find3(result.smart_addr, function (err, results) {
                            if (err) {
                                console.log('error occured.');
                                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                res.write('<script>alert("Database Error occured");' +
                                    'location.href="/mypage"</script>');
                                return res.end();
                            }
                            if (results[0] != null) {
                                // console.log('사용자 인증된 상태임.');
                                // console.log('회원정보 로드.');
                                // console.dir(req.user);

                                console.log("#####", results);
                                context.login_success = true;
                                context.user = req.user;
                                context.output = undefined;
                                context.smartContractAddress = results[0].posts.smart_addr;
                                context.title = results[0].posts.title;
                                context.toAddress = results[0].wallet_address;
                                context.toId = results[0].id;

                                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                req.app.render('useToken', context, function (err, html) {
                                    if (err) {
                                        console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                                        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                        res.write('<script>alert("응답 웹문서 생성 중 에러 발생" + err.stack);' +
                                            'location.href="/mypage"</script>');
                                        res.end();
                                        return;
                                    }
                                    res.end(html);
                                });
                            } else {
                                console.log('시공사를 먼저 등록.');
                                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                res.write('<script>alert("시공사를 먼저 등록해 주세요.");' +
                                    'location.href="/mypage"</script>');
                                return res.end();
                            }
                        });

                    }
                }
            } else {
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("데이터베이스 연결 실패" + err.stack);' +
                    'location.href="/mypage"</script>');
                res.end();
            }

        });
    }
}

var use = function (req, res) {
    console.log("useToken/use 접근");
    if (!req.user) {
        console.log('mypage: 사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        res.end();
    } else {
        var context = {};
        console.log('회원정보 로드.');
        // console.dir(req.user);
        context.login_success = true;
        context.user = req.user;

        var encryptionWallet = req.user.accountEncryption;
        var walletPassword = req.user.wallet_password;

        var toAddress = req.body.toAddress;
        var tokenAmount = req.body.tokenAmount;
        var content = req.body.content;
        var contractAddress = req.body.smartContractAddress;

        console.log("to Address : ", toAddress);
        console.log("tokenAmount : ", tokenAmount);
        console.log("content : ", content);

        // toAddress가 은행 or 시행사인지 체크
        // smartcontract 가져오기

        //accountEncryption, password, contractAddress, toAddress, amount, content, callback
        connection.useToken(encryptionWallet, walletPassword, contractAddress, toAddress, tokenAmount, content, function (result) {
            if (result) {
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("등록 성공");' +
                    'location.href="/mypage"</script>');
                res.end();
            }
            else {
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("등록 실");' +
                    'location.href="/mypage"</script>');
                res.end();
            }
        });
    }
};

module.exports.useToken = useToken;
module.exports.use = use;