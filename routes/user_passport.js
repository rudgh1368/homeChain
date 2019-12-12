// 패스포트 라우팅 함수 정의

module.exports = function(router, passport) {
    console.log('user_passport 호출됨.');

    // 메인화면
    router.route('/').get(function(req, res){
        var database = req.app.get('database');
        var menu_count = 0;
        if (database.db){
            // counting()이 실행된 후 실행
            database.PostModel.counting().then(function (result){
                menu_count = result;
                var context = {count: menu_count};
                // 인증 안된 경우
                if(!req.user){
                    console.log('사용자 인증 안된 상태임.');
                    context.login_success = false;
                    res.render('index.ejs', context);
                } else{
                    console.log('사용자 인증된 상태임.');
                    console.log('회원정보 로드.');
                    console.dir(req.user);
                    context.login_success = true;
                    context.user = req.user;
                    res.render('index.ejs', context);
                }
            }).catch(function (e){
                console.log("error in promise");
            });
        }
        console.log('/ 패스 요청됨.');
        console.log('req.user의 정보');
        console.dir(req.user);
    });

    // 로그인 화면
    router.route('/login').get(function(req, res){
        console.log('/login 패스 요청됨.');
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    // 회원가입 화면
    router.route('/signup').get(function(req, res){
        console.log('/signup 패스 요청됨.');
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });


    // 로그아웃
    router.route('/logout').get(function(req, res){
        console.log('/logout 패스 요청됨.');
        req.logout();
        res.redirect('/');
    });

    // 로그인 인증
    router.route('/login').post(passport.authenticate('local-login', {
        successRedirect : '/',
        failureRedirect : '/login',
        failureFlash : true
    }));

    // 회원가입 인증
    router.route('/signup').post(passport.authenticate('local-signup', {
        successRedirect : '/',
        failureRedirect : '/signup',
        failureFlash : true
    }));

}