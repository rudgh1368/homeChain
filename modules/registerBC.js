var fs = require('fs');
var connection = require('../connection/connect');

module.exports = {

    readEncryptionFile : function (accountEncryption, password, fileName, path, callback) {
        var encryptionFile = fs.readFileSync(path, 'utf8');
        encryptionFile = JSON.parse(encryptionFile.toString());
        console.log("encryptionFile : ", encryptionFile);

        var messageHash = encryptionFile.messageHash;
        var v = encryptionFile.v;
        var r = encryptionFile.r;
        var s = encryptionFile.s;

        var name = fileName.split("|");
        var contractAddress = name[0];
        var toAddress = name[1];
        var investmentAmount = name[2];
        var investmentForm = name[3];

        console.log('messageHash : ', messageHash );
        console.log('v : ', v );
        console.log('r : ', r );
        console.log('s : ', s );

        // accountEncryption, password, contractAddress, toAddress,  messageHash, v, r, s, amount, position, callback
        connection.investBuilding(accountEncryption, password, contractAddress, toAddress, messageHash, v, r, s, investmentAmount, investmentForm, function (result) {
            if(result){
                console.log("등록완료");
                callback(true);
            }else{
                console.log("등록실패");
                callback(false);
            }
        })
    }
};