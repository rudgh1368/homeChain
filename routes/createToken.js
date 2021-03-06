var connection = require('../connection/connect');
var fs = require('fs');

var createToken = function (req, res) {
    console.log("createToken 접근");

    if(!req.user){
        console.log('사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        res.end();
    } else if (req.user.id != "BANK"){
        console.log('권한 없는 사용자.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("권한이 없습니다.");' +
            'location.href="/"</script>');
        res.end();
    } else{
        var context = {}
        console.log('사용자 인증된 상태임.');
        console.log('회원정보 로드.');
        console.dir(req.user);
        context.login_success = true;
        context.user = req.user;
        context.output = undefined;
        res.render('createToken.ejs', context);
    }


}

var create = function (req, res) {
    var database = req.app.get('database');
    var smartContractAddress;
    var to;

    console.log("addToken/create 접근");
    console.log("to : ", req.body.to);
    console.log("investmentAmount : ", req.body.investmentAmount);
    console.log("smartContractAddress : ", req.body.smartContractAddress);
    console.log("investmentForm : ", req.body.investmentForm);

    var targetId = req.body.to;
    var investmentAmount = req.body.investmentAmount;
    var code = req.body.smartContractAddress.toString(10)*1;
    var investmentForm = req.body.investmentForm;

    if(!req.user){
        console.log('사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        res.end();
    } else if (req.user.id != "BANK"){
        console.log('권한 없는 사용자.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("권한이 없습니다.");' +
            'location.href="/"</script>');
        res.end();
    } else{
        var context = {}
        console.log('사용자 인증된 상태임.');
        console.log('회원정보 로드.');
        console.dir(req.user);
        context.login_success = true;
        context.user = req.user;
        database.CodeModel.findCode(code, function (err, codeResult){
            if (err) return;
            if (codeResult) {
                database.UserModel.findById(targetId, function (err, userResult){
                    if (err) return;
                    if (userResult) {

                        smartContractAddress = codeResult[0].smart_addr.smart_addr;
                        to = userResult[0].wallet_address;

                        if(to && investmentAmount && smartContractAddress && investmentForm) {
                            console.log("정상입력");

                            var message = smartContractAddress + "|" + to + "|" + investmentAmount + '|' + investmentForm + "|";

                            // sign (contractaddress/to/index/investmentAmount) index -> 1 : 투자자, 2: 수분양자
                            connection.signToken(message, function (signedToken) {
                                var json = JSON.stringify(signedToken);
                                var fileName = './' + message + '.json';

                                fs.writeFileSync(fileName ,json, 'utf8');
                                context.output = "success"
                                res.render('createToken.ejs', context);
                            });

                        }else{
                            console.log("입력요구");
                            context.output = "fail"
                            res.render('createToken.ejs', context);
                        }
                    }
                });

            }
        });
    }
};

module.exports.createToken = createToken;
module.exports.create = create;