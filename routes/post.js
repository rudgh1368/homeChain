// 게시판을 위한 라우팅 함수 정의

// showpost.ejs 에서 사용함
var Entities = require('html-entities').AllHtmlEntities;
var formidable = require('formidable');
var fs = require('fs');
var connection = require('../connection/connect');

var addpost = function (req, res) {
    console.log('post 모듈 안에 있는 addpost 호출됨.');

    if (!req.user) {
        console.log('post: 사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        res.end();
    } else {
        var context = {};
        console.log('post: 사용자 인증된 상태임.');
        console.log('회원정보 로드.');
        console.dir(req.user);
        context.login_success = true;
        context.user = req.user;

        req.app.render('addpost', context, function (err, html) {

            if (err) {
                console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("응답 웹문서 생성 중 에러 발생");' +
                    'location.href="/"</script>');
                res.end();
                return;
            } else res.end(html);

        });
    }

}

var write = function (req, res) {
    console.log('post 모듈 안에 있는 write 호출됨.');

    var paramWallet = req.user.wallet_address;
    var paramWriter = req.user.id;
    var paramEncryptionWallet = req.user.accountEncryption;
    var paramWalletPassword = req.user.wallet_password;
    var paramTitle;
    var paramLocation;
    var paramGoal;
    var paramDate;
    var paramLink1;
    var paramLink2;
    var paramLink3;
    var paramLink4;
    var paramLink5;
    var paramFile;

    var form = new formidable.IncomingForm();

    var uri = __dirname + '/../uploads/';

    try {
        fs.mkdirSync(uri + paramWallet);
        // fs.writeFileSync(uri + paramWallet + "/" + newPath , a, encoding='utf8')
    } catch (err) {
        if (err.code !== 'EEXIST') {
            console.log("directory already exist" + err);
            // fs.writeFileSync(__dirname + '/zzzzzz/aa', a, encoding='utf8')
        }
    }
    try {
        form.uploadDir = uri + paramWallet;
        form.keepExtensions = true;
        form.parse(req, function (err, fields, files) {
            var yyyymmdd = fields.date;
            console.log("!!!!!!!", yyyymmdd);
            if (yyyymmdd == "" || (new Date(yyyymmdd).getTime() - new Date().getTime()) < 0) {
                console.log('wrong date selected');
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("날짜를 다시 선택해주세요.");' +
                    'location.href="/addpost"</script>');
                return res.end();
            }
            if (files.pdfFile.name == "") {
                console.log('there is no file');
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("pdf 파일을 넣어주세요.");' +
                    'location.href="/addpost"</script>');
                return res.end();
            }
            console.log("files", files.pdfFile.path);

            // 파일이름에 날짜 입력
            var today = new Date();
            var ss = today.getSeconds();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();

            if (dd < 10) {
                dd = '0' + dd
            }

            if (mm < 10) {
                mm = '0' + mm
            }

            if (ss < 10) {
                ss = '0' + ss
            }


            today = yyyy + '.' + mm + '.' + dd + "." + ss + ".";

            var newName = today + files.pdfFile.name;
            var newPath = form.uploadDir + "/" + newName;

            fs.renameSync(files.pdfFile.path, newPath);

            paramTitle = fields.title;
            paramLocation = fields.location;
            paramGoal = fields.goal_fund;
            paramDate = fields.date;
            paramLink1 = fields.link1;
            paramLink2 = fields.link2;
            paramLink3 = fields.link3;
            paramLink4 = fields.link4;
            paramLink5 = fields.link5;
            paramFile = newName;

            var locationCode;

            switch(paramLocation) {
                case "서울":
                    locationCode = "so";
            }

            var now = new Date();
            var duration = new Date(paramDate);

            var gap = (duration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            console.log("deploy goalMoney : ", paramGoal);
            console.log("deploy duration : ", Math.ceil(gap));

            duration = Math.ceil(gap);

            // deploy smartContract
            connection.deploy(paramEncryptionWallet, paramWalletPassword, paramGoal, duration, function (contractAddress) {
                console.log("deploy sucess");

                // register building
                // parameter : accountEncryption, password, contractAddress, _land_information, _history, _permission, _profit_analysis, _demo, _con_guide, _info, callback
                connection.registerBuilding(paramEncryptionWallet, paramWalletPassword, contractAddress, paramLink1, paramLink2, paramLink3, paramLink4, paramLink5, function (result) {

                    // register cucess
                    if (result == true) {
                        console.log('요청 파라미터 : ' + paramWallet + ', ' + paramWriter + ', ' + paramTitle
                            + ', ' + paramLocation + ', ' + paramGoal + ', ' + paramDate + ', ' + paramLink1 + ', '
                            + paramLink2 + ', ' + paramLink3 + ', ' + paramLink4 + ', ' + paramLink5 + ', ' + paramFile);

                        var database = req.app.get('database');

                        // 데이터베이스 객체가 초기화 된 경우
                        if (database.db) {
                            // 1. 아이디를 이용해 사용자 검색
                            database.UserModel.adding_post(paramWriter, paramTitle, contractAddress, function (err, results) {
                                if (err) {
                                    console.error('게시판 글 추가 중 에러 발생 : ' + err.stack);

                                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                    res.write('<script>alert("게시판 글 추가 중 에러 발생");' +
                                        'location.href="/addpost"</script>');
                                    res.end();

                                    return;
                                }

                                if (results == undefined || results.length < 1) {
                                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                    res.write('<script>alert("등록된 회원이 아닙니다.");' +
                                        'location.href="/addpost"</script>');
                                    res.end();

                                    return;
                                }

                                var userObjectId = results[0]._doc._id;

                                console.log('사용자 ObjectId : ' + paramWriter + ' -> ' + userObjectId);

                                // save()로 저장
                                // PostModel 인스턴스 생성
                                var post = new database.PostModel({
                                    dev_wallet: paramWallet,
                                    writer: userObjectId,
                                    title: paramTitle,
                                    location: paramLocation,
                                    goal_fund: paramGoal,
                                    duration: paramDate,
                                    link1: paramLink1,
                                    link2: paramLink2,
                                    link3: paramLink3,
                                    link4: paramLink4,
                                    link5: paramLink5,
                                    fileName: paramFile,
                                    smart_addr: contractAddress
                                });
                                // var user = new database.UserModel(results);
                                // user 스키마에 작성 글 정보 추가, 글 쓰는건 시행사기 때문에 1번이 됨
                                // user.updateRole(function(err, result){
                                //     if (err) {
                                //         if (err) {
                                //             console.error('rule 설정 오류 : ' + err.stack);
                                //
                                //             res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                //             res.write('<script>alert("rule 설정 오류");' +
                                //                 'location.href="/addpost"</script>');
                                //             res.end();
                                //
                                //             return;
                                //         }
                                //     }
                                // });
                                post.savePost(function (err, result) {
                                    if (err) {
                                        console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                                        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                        res.write('<script>alert("모든 사항을 입력해 주세요.");' +
                                            'location.href="/addpost"</script>');
                                        res.end();

                                        return;
                                    }
                                    if (result) {
                                        var idx;
                                        var obj_id = result._id;
                                        database.CodeModel.findBiggest(async function (err, result){
                                            if (err){
                                                console.error('게시판 글 추가 중 에러 발생 : ' + err.stack);

                                                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                                res.write('<script>alert("게시판 글 추가 중 에러 발생");' +
                                                    'location.href="/addpost"</script>');
                                                res.end();

                                                return;
                                            }
                                            if (result){
                                                var relTable = null;
                                                var makeModel = function(relTable, idx, obj_id){
                                                    relTable = new database.CodeModel({
                                                        code: idx,
                                                        smart_addr: obj_id
                                                    });
                                                    return relTable;
                                                }
                                                if (result[0] == null) {
                                                    idx = 1;
                                                }
                                                else {
                                                    idx = result[0].code + 1;
                                                }
                                                await makeModel(relTable, idx, obj_id).savePost(function (err, result){
                                                    if (err){
                                                        console.error('게시판 글 추가 중 에러 발생 : ' + err.stack);

                                                        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                                        res.write('<script>alert("게시판 글 추가 중 에러 발생");' +
                                                            'location.href="/addpost"</script>');
                                                        res.end();

                                                        return;
                                                    }
                                                    if (result){
                                                        console.log("글 데이터 추가함.");
                                                        console.log('글 작성', '게시글을 생성했습니다. : ' + post._id);

                                                        return res.redirect('/listpost');
                                                        // return res.redirect('/showpost/' + post._id);
                                                    }
                                                })
                                            }
                                        })
                                    }
                                });
                            });
                        } else {
                            res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                            res.write('<script>alert("데이터베이스 연결 실패");' +
                                'location.href="/addpost"</script>');
                            res.end();
                        }
                    }
                });
            });
        });
    } catch (err){
        console.log('error: ' + err);
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("모든 정보를 입력해주세요.");' +
            'location.href="/addpost"</script>');
        return res.end();
    }

};

var listpost = function (req, res) {
    console.log('post 모듈 안에 있는 listpost 호출됨.');

    var paramPage = req.body.page || req.query.page;
    var paramPerPage = req.body.perPage || req.query.perPage;

    console.log('요청 파라미터 : ' + paramPage + ', ' + paramPerPage);

    var database = req.app.get('database');

    // 데이터베이스 객체가 초기화된 경우
    if (database.db) {
        // 1. 글 리스트
        var options = {
            page: paramPage,
            perPage: paramPerPage
        }

        database.PostModel.list(options, function (err, results) {
            if (err) {
                console.error('게시판 글 목록 조회 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("게시판 글 목록 조회 중 에러 발생");' +
                    'location.href="/"</script>');
                res.end();

                return;
            }

            if (results) {
                console.dir(results);

                // 전체 문서 객체 수 확인
                database.PostModel.count().exec(function (err, count) {
                    // 뷰 템플레이트를 이용하여 렌더링한 후 전송=
                    var context = {
                        title: '글 목록',
                        posts: results,
                        page: 1, //parseInt(paramPage),
                        pageCount: 1, //Math.ceil(count / paramPerPage),
                        perPage: 10, //paramPerPage,
                        totalRecords: count,
                        size: paramPerPage
                    };
                    // var cp = context.posts;
                    // console.log("cp: " + cp);
                    // for (var i = 0; i < cp.size; i++){
                    //     var time = cp[i]._doc.created_at;
                    //     cp[i]._doc.created_at = time.substring(time.length - 20);
                    //     console.log(time);
                    // }
                    if (!req.user) {
                        console.log('post: 사용자 인증 안된 상태임.');
                        context.login_success = false;
                    } else {
                        console.log('post: 사용자 인증된 상태임.');
                        console.log('회원정보 로드.');
                        console.dir(req.user);
                        context.login_success = true;
                        context.user = req.user;
                    }

                    req.app.render('listpost', context, function (err, html) {

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

            } else {
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("글 목록 조회 실패" + err.stack);' +
                    'location.href="/"</script>');
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("데이터베이스 연결 실패" + err.stack);' +
            'location.href="/"</script>');
        res.end();
    }

};


var showpost = function (req, res) {
    console.log('post 모듈 안에 있는 showpost 호출됨.');

    if (!req.user) {
        console.log('post: 사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        res.end();
    } else {
        // URL 파라미터로 전달됨
        var paramId = req.body.id || req.query.id || req.params.id;

        console.log('요청 파라미터 : ' + paramId);

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

                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});

                    // 뷰 템플레이트를 이용하여 렌더링한 후 전송
                    var context = {
                        posts: results,
                        Entities: Entities,
                    };

                    if (!req.user) {
                        console.log('post: 사용자 인증 안된 상태임.');
                        context.login_success = false;
                    } else {
                        console.log('post: 사용자 인증된 상태임.');
                        console.log('회원정보 로드.');
                        console.dir(req.user);
                        context.login_success = true;
                        context.user = req.user;
                    }

                    var paramEncryptionWallet = req.user.accountEncryption;
                    var paramWalletPassword = req.user.wallet_password;
                    var contractAddress = results.smart_addr;
                    var userPosts = req.user.posts;
                    var master;
                    for (var i = 0; i < userPosts.length; i++) {
                        if (userPosts[i].smart_addr == contractAddress) {
                            if (userPosts[i].role == 1) {
                                master = 1;
                                break;
                            } else {
                                master = 0;
                                break;
                            }
                        } else master = 0;
                    }
                    console.log("smartContract adderss : ", contractAddress);

                    connection.checkInvestState(paramEncryptionWallet, paramWalletPassword, contractAddress, function (result) {

                        var fundingGoalMoney = result[0];
                        var amountRaised = result[1];
                        var interestedPersonsNumber = result[2];
                        var state = result[3];
                        var buildingConstructor = result[4];

                        if (buildingConstructor == "0x0000000000000000000000000000000000000000") {
                            buildingConstructor = "등록 X";
                        }
                        else {
                            master = 2;
                        }

                        switch (state) {
                            case '0' :
                                state = "투자 진행중";
                                break;
                            case '1' :
                                state = "투자 완료, 시공중";
                                break;
                            case '2' :
                                state = "종료";
                                break;
                            case '3' :
                                state = "시공 완료";
                                break;
                            case '4' :
                                state = "종료";
                                break;
                        }

                        console.log("buildingConstructor : ", buildingConstructor);
                        console.log("state : ", state);

                        database.UserModel.findByWallet(buildingConstructor, function(err, result){
                            if (err){
                                console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                res.write('<script>alert("응답 웹문서 생성 중 에러 발생" + err.stack);' +
                                    'location.href="/listpost"</script>');
                                res.end();
                                return;
                            }
                            if (result){
                                context.fundingGoalMoney = fundingGoalMoney;
                                context.amountRaised = amountRaised;
                                context.interestedPersonsNumber = interestedPersonsNumber;
                                context.state = state;
                                if (result[0] == null) {
                                    context.buildingConstructor = buildingConstructor;
                                } else {
                                    context.buildingConstructor = result[0].id;
                                }
                                context.master = master;
                                context.paramId = paramId;

                                req.app.render('showpost', context, function (err, html) {
                                    if (err) {
                                        console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                                        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                        res.write('<script>alert("응답 웹문서 생성 중 에러 발생" + err.stack);' +
                                            'location.href="/listpost"</script>');
                                        res.end();
                                        return;
                                    }

                                    res.end(html);
                                });
                            }
                        });

                    });

                } else {
                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                    res.write('<script>alert("글 조회 실패" + err.stack);' +
                        'location.href="/listpost"</script>');
                    res.end();
                }
            });
        } else {
            res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
            res.write('<script>alert("데이터베이스 연결 실패" + err.stack);' +
                'location.href="/listpost"</script>');
            res.end();
        }
    }


};


var download = function (req, res) {
    var paramId = req.body.id || req.query.id || req.params.id;
    var url = "/showpost/" + paramId;
    var database = req.app.get('database');

    if (database.db) {
        database.PostModel.findPDF(paramId, function (err, result) {
            if (err) {
                console.error('게시판 글 조회 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("게시판 글 조회 중 에러 발생" + err.stack);' +
                    'location.href=' + url + '</script>');
                res.end();
                return;
            }
            if (result) {
                var fileName = result[0].fileName;
                var folder = result[0].dev_wallet;
                var path = __dirname + "/../uploads/" + folder + "/";
                var file = path + fileName;
                console.log("file: " + file);
                res.download(file);
            }
        });
    } else {
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("데이터베이스 연결 실패" + err.stack);' +
            'location.href=' + url + '</script>');
        res.end();
    }
}

module.exports.addpost = addpost;
module.exports.listpost = listpost;
module.exports.write = write;
module.exports.showpost = showpost;
module.exports.download = download;