var utils = require('../utils/utils');
var postSchema = {};

postSchema.createSchema = function (mongoose) {

    // 스키마 정의
    var PostSchema = mongoose.Schema({
            dev_wallet: {type: String, required: true},
            writer: {type: mongoose.Schema.ObjectId, ref: 'hncUsers', required: true},
            goal_fund: {type: String, required: true},
            duration: {type: Date, required: true},
            title: {type: String, required: true, trim: true, 'default': ''},
            location: {type: String, required: true},
            smart_addr: {type: String},
            link1: {type: String, required: true},
            link2: {type: String, required: true},
            link3: {type: String, required: true},
            link4: {type: String, required: true},
            link5: {type: String, required: true},
            fileName: {type: String, required: true},
            investor: [{
                inv_addr: {type: String, 'default': ''}
            }],
            builder: {type: String, 'default': ''},
            created_at: {type: Date, index: {unique: false}, 'default': Date.now},
            updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
        },
        {
            toObject: {virtuals: true} // virtual들을 object에서 보여주는 mongoose schema의 옵션
        }
    );

    // password를 virtual 메소드로 정의 : MongoDB에 저장되지 않는 편리한 속성임. 특정 속성을 지정하고 set, get 메소드를 정의함
    PostSchema.virtual('createdTime')
        .get(function () {
            return getDate(this.created_at) + " " + getTime(this.created_at)
        });
    PostSchema.virtual('updatedTime')
        .get(function () {
            return getDate(this.updated_at) + " " + getTime(this.updated_at)
        });

    // 시간 예쁘게 보여주기 위한 메소드
    function getDate(dateObj) {
        if (dateObj instanceof Date)
            return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth() + 1) + "-" + get2digits(dateObj.getDate());
    }

    function getTime(dateObj) {
        if (dateObj instanceof Date)
            return get2digits(dateObj.getHours()) + ":" + get2digits(dateObj.getMinutes()) + ":" + get2digits(dateObj.getSeconds());
    }

    function get2digits(num) {
        return ("0" + num).slice(-2);
    }

    // 스키마에 모델 인스턴스에서 사용할 수 있는 메소드 추가
    // 필수 속성에 대한 required validation
    PostSchema.path('dev_wallet').required(true, '먼저 로그인 하세요.');
    PostSchema.path('goal_fund').required(true, '목표 모금액을 설정해주세요.');
    PostSchema.path('duration').required(true, '모금 기한일을 설정해주세요.');
    PostSchema.path('writer').required(true, '먼저 로그인 하세요.');
    PostSchema.path('title').required(true, '제목을 입력해주세요.');
    PostSchema.path('link1').required(true, '링크를 입력해주세요.');
    PostSchema.path('link2').required(true, '링크를 입력해주세요.');
    PostSchema.path('link3').required(true, '링크를 입력해주세요.');
    PostSchema.path('link4').required(true, '링크를 입력해주세요.');
    PostSchema.path('link5').required(true, '링크를 입력해주세요.');
    PostSchema.path('fileName').required(true, '파일을 넣어주세요.');


    // 스키마에 인스턴스 메소드 추가
    PostSchema.methods = {
        savePost: function (callback) {
            var self = this;
            this.validate(function (err) {
                if (err) {
                    return callback(err);
                }
                self.save(callback);
            });
        },
        // addComment: function (user, comment, callback) {		// 댓글 추가
        //     this.comment.push({
        //         contents: comment.contents,
        //         writer: user._id
        //     });
        //
        //     this.save(callback);
        // },
        // removeComment: function (id, callback) {		// 댓글 삭제
        //     var index = utils.indexOf(this.comments, {id: id});
        //     if (~index) {
        //         this.comments.splice(index, 1);
        //     } else {
        //         return callback('ID [' + id + '] 를 가진 댓글 객체를 찾을 수 없습니다.');
        //     }
        //
        //     this.save(callback);
        // }
    }

    PostSchema.statics = {
        // ID로 글 찾기
        load: function (id, callback) {
            this.findOne({_id: id})
                .populate('writer', 'name provider id')
                .populate('comments.writer')
                .exec(callback);
        },
        list: function (options, callback) {
            var criteria = options.criteria || {};

            this.find(criteria)
                .populate('writer', 'name provider id')
                .sort({'created_at': -1})
                .limit(Number(options.perPage))
                .skip(options.perPage * options.page)
                .exec(callback);
        },
        counting: function () {
            var self = this;
            // 비동기 문제를 해결하기 위한 promise 사용
            return new Promise(function (resolve, reject) {
                resolve(self.collection.countDocuments());
            });
        },
        findByAddress: function (smart_addr, callback) {
            return this.find({smart_addr: smart_addr}, callback);
        },
        forMypage: function (list, callback) {
            var titles = [];
            for (i = 0; i < list.length; i++) {
                titles[i] = {title: list[i]};
            }
            console.log(titles);
            return this.find({$or: titles}, callback);
        },
        findPDF: function (id, callback) {
            return this.find({_id: id}, callback);
        },
        add_constructor: function (wallet_address, smart_add, callback) {
            this.update({smart_addr: smart_add}, {$set: {builder: wallet_address}}, function (e) {
            });
            return this.find({wallet_address: wallet_address}, callback);
        },
        add_investor: function (wallet_address, smart_add, callback) {
            this.update({smart_addr: smart_add}, {$push: {investor: {inv_addr: wallet_address}}}, function (e) {
            });
            return this.find({wallet_address: wallet_address}, callback);
        }
    }

    console.log('PostSchema 정의함.');

    return PostSchema;
};

// module.exports에 PostSchema 객체 직접 할당
module.exports = postSchema;