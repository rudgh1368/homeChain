var connect = require('../connection/connect');

var transactionHistory = function (req, res){
    var context = {};

    if (!req.user) {
        console.log('post: 사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        res.end();
    }else {
        console.log('post: 사용자 인증된 상태임.');
        console.log('회원정보 로드.');
        console.dir(req.user);
        context.login_success = true;
        context.user = req.user;

        var paramId = req.body.id || req.query.id || req.params.id;

        var database = req.app.get('database');

        // 데이터베이스 객체가 초기화된 경우
        if (database.db) {
            // 1. 글 리스트
            database.PostModel.load(paramId, function (err, results) {
                if (err) {
                    console.error('게시판 글 조회 중 에러 발생 : ' + err.stack);

                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                    res.write('<script>alert("게시판 글 조회 중 에러 발생" + err.stack);' +
                        'location.href="/listpost"</script>');
                    res.end();
                    return;
                }
                if (results) {
                    var contractAddress = results.smart_addr;
                    var paramEncryptionWallet = req.user.accountEncryption;
                    var paramWalletPassword = req.user.wallet_password;

                    console.log("contractAddress : ", contractAddress);
                    connect.checkMypageState(paramEncryptionWallet, paramWalletPassword, contractAddress, function (result) {

                        var myBalance = result[0];
                        var developerBalance = result[1];
                        var fundingMoney = result[2];
                        var investBalance = result[3];
                        var statementLength = result[4];

                        console.log("myBalance : ", myBalance);
                        console.log("developerBalance : ", developerBalance);
                        console.log("fundingMoney : ", fundingMoney);
                        console.log("investBalance : ", investBalance);
                        console.log("statementLength : ", statementLength);

                        context.myBalance = myBalance;
                        context.developerBalance= developerBalance;
                        context.fundingMoney = fundingMoney;
                        context.investBalance = investBalance;
                        context.paramId = paramId;
                        context.title = results.title;

                        var contents = new Array();

                        if (statementLength == 0 ) {
                            context.contents = contents;
                            req.app.render('transactionHistory', context, function (err, html) {
                                if (err) {
                                    console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                    res.write('<script>alert("응답 웹문서 생성 중 에러 발생" + err.stack);' +
                                        'location.href="/mypage"</script>');
                                    res.end();
                                    return;
                                }
                            });
                        }
                        else {
                            index = 0;
                            var callValue = function(index) {
                                return new Promise(function (resolve, reject) {
                                    connect.checkUseToken(paramEncryptionWallet, paramWalletPassword, contractAddress, index, function (result2) {
                                        console.log(index)
                                        var fromAddress = result2[0];
                                        var toAddress = result2[1];
                                        var amout = result2[2];
                                        var content = result2[3];

                                        console.log(index, "번째 content")
                                        console.log("fromAddress : ", fromAddress);
                                        console.log("toAddress : ", toAddress);
                                        console.log("amout : ", amout);
                                        console.log("content : ", content);

                                        var output = {};
                                        output.fromAddress = fromAddress;
                                        output.toAddress = toAddress;
                                        output.amount = amout;
                                        output.content = content;

                                        contents.push(output);
                                        resolve(index);
                                    })
                                })
                            }
                            callValue(index).then(function (index) {
                                if (index == statementLength-1) {
                                    console.log('callValue 만족')
                                    context.contents = contents;
                                    database.CodeModel.findAddr(paramId, async function(err, codeResult){
                                        if (codeResult) {
                                            context.code = ((codeResult[0].code)*1).toString(16);
                                            await database.UserModel.findByWallet(contents[0].fromAddress, async function(err, fromResult) {
                                                if (fromResult){
                                                    context.fromId = fromResult[0].id;
                                                    await database.UserModel.findByWallet(contents[0].toAddress, async function(err, toResult) {
                                                        if (toResult){
                                                            context.toId = toResult[0].id;
                                                            await req.app.render('transactionHistory', context, function (err, html) {
                                                                if (err) {
                                                                    console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);
                                                                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                                                    res.write('<script>alert("응답 웹문서 생성 중 에러 발생" + err.stack);' + 'location.href="/mypage"</script>');
                                                                    res.end();
                                                                    return;
                                                                }
                                                                return res.end(html);
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    console.log('callValue 불만족')
                                    index +=1
                                    callValue(index)
                                }
                            }, function (error) {
                                console.log("callValue error", error);
                            })
                        }
                    });
                };
            });
        };
    };
};

module.exports.transactionHistory = transactionHistory;
