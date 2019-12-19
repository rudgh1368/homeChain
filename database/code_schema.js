var CodeSchema = {};

CodeSchema.createSchema = function (mongoose) {
    // 스키마 정의
    var CodeSchema = mongoose.Schema({
            code: {type: Number},
            smart_addr: {type: mongoose.Schema.ObjectId, ref: 'hncPosts', required: true}
        }
    );

    // 스키마에 인스턴스 메소드 추가
    CodeSchema.methods = {
        savePost: function (callback) {
            var self = this;
            this.validate(function (err) {
                if (err) {
                    return callback(err);
                }
                self.save(callback);
            });
        }
    }

    CodeSchema.statics = {
        findBiggest: function (callback) {
            this.aggregate([
                {
                    $group: { _id: "$smart_addr", code: { $sum: "$code" } }
                },
                {
                    $sort: {code: -1}
                },
                {
                    $limit: 1
                }
            ]).exec(callback);
        },
        findCode: function (code, callback) {
            return this.find({code: code})
                .populate('smart_addr')
                .exec(callback);
        },
        findAddr: function (Oid, callback) {
            return this.find({smart_addr: Oid})
                .populate('smart_addr')
                .exec(callback);
        }
    }

    console.log('CodeSchema 정의함.');

    return CodeSchema;
};

// module.exports에 PostSchema 객체 직접 할당
module.exports = CodeSchema;