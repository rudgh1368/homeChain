var connection = require('../connection/connect');

var useToken = function (req, res) {
    console.log("useToken 접근");

    if (!req.user) {
        console.log('사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        res.end();
    } else {
        var paramId = req.body.id || req.query.id || req.params.id;
        var context = {};
        console.log('사용자 인증된 상태임.');
        console.log('회원정보 로드.');
        console.dir(req.user);
        context.login_success = true;
        context.user = req.user;
        context.output = undefined;

        var database = req.app.get('database');

        if (database.db) {
            database.PostModel.load(paramId, function (err, results) {
                if (err) {
                    console.error('글 조회 중 에러 발생 : ' + err.stack);

                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                    res.write('<script>alert("글 조회 중 에러 발생" + err.stack);' +
                        'location.href="/mypage"</script>');
                    res.end();
                    return;
                }

                if (results) {
                    res.render('useToken.ejs', context);
                }
            });
        } else {
            res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
            res.write('<script>alert("데이터베이스 연결 실패" + err.stack);' +
                'location.href="/mypage"</script>');
            res.end();
        }
    }
}

var use = function (req, res) {
    console.log("useToken/use 접근");

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
                'location.href="/"</script>');
            res.end();
        }
    });
};

module.exports.useToken = useToken;
module.exports.use = use;