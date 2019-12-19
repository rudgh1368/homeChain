let fs = require("fs");
let Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const abi = fs.readFileSync(__dirname + '/homeChain.json');
const bytecode = fs.readFileSync(__dirname + '/homeChain.txt', 'utf8').toString();

// HomeChain Setting
const HomeChain = new web3.eth.Contract(JSON.parse(abi));// abi (json)형식으로 가져와야한다.

// The transaction does not require a fee.
HomeChain.options.gasPrice = 0;

// 은행 정보
// private key = 0xae950f323a3155496625b2936f84750513488cd85e0ecc1b887dcd2f35999e84
// adderss = 0xec58179D7BD7CBEd4D1a76376A1c961C61548071

module.exports = {
    createAccount : function(password, callback){
        console.log('web3, create_account 접근');

        var newAccount = web3.eth.accounts.create();

        var address = newAccount.address;
        var privateKey = newAccount.privateKey;
        console.log("address : ", address);
        console.log("privateKey : ", privateKey);

        var accountEncryption = web3.eth.accounts.encrypt(privateKey, password);
        console.log("accountEncryption : ", accountEncryption);

        sendEther(address);
        var result = {address : address, privateKey : privateKey, accountEncryption : accountEncryption};

        callback(result);
    },

    // create SmartContract
    deploy : function(accountEncryption, password, fundingGoalMonry, duration, callback){
        console.log("web3, delpoy 접근");

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;
        var privateKey = accountDecryption.privateKey;
        HomeChain.setProvider(web3.currentProvider);

        var transfer = HomeChain.deploy({
            data : "0x" + bytecode,
            arguments : [fundingGoalMonry, duration]
        });
        var encodedABI = transfer.encodeABI();

        var tx = {
            from: address,
            gas: 6721975,
            data: encodedABI
        };

        web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
            var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);
             tran.catch(function (error) {
                 console.log("delpoy error");
                 console.log(error);
            });
            //
            tran.on('receipt', receipt => {
                console.log('contractAddress : ' + receipt.contractAddress);
                callback(receipt.contractAddress);
            });
        });
    },

    registerBuilding : function (
        accountEncryption,
        password,
        contractAddress,
        _history,
        _permission,
        _profit_analysis,
        _con_guide,
        _info,
        callback) {
        console.log('web3, registerBuilding 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;
        var privateKey = accountDecryption.privateKey;
        HomeChain.setProvider(web3.currentProvider);
        HomeChain.options.address = contractAddress;

        var transfer = HomeChain.methods.registerBuilding(_history, _permission, _profit_analysis, _con_guide, _info);
        var encodedABI = transfer.encodeABI();

        var tx = {
            from : address,
            to : contractAddress,
            gas : 6721975,
            data : encodedABI
        };

        web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
            var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

            tran.catch(function (error) {
                console.log("registerBuilding error");
                console.log(error);
                callback(false);
            });

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
                callback(true);
            });
        });
    },

    showBuildingInformation : function (accountEncryption, password, contractAddress, callback) {
        console.log('web3, show 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;
        var privateKey = accountDecryption.privateKey;

        HomeChain.setProvider(web3.currentProvider);
        HomeChain.options.address = contractAddress;

        HomeChain.methods.checkBuildingInformation().call({
            from : address
        }, function (err, result) {
            if(err) {
                console.log(err);
                callback(err)
            }
            else {
                console.log('showBuildingInformation : ', result)
                callback(result)
            }
        })
    },

    signToken : function (message, callback) {
        console.log('web3, signToken 접근');

        var signToken = web3.eth.accounts.sign(message, '0x395ebaaa75802cde853c43cab78eddf29127d2cfec062b478ce705f466582beb');
        console.log('signToken : ', signToken);

        callback(signToken);
    },

    investBuilding : function (accountEncryption, password, contractAddress, toAddress,  messageHash, v, r, s, amount, position, callback) {
        console.log('web3, investBuilding 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);

        //address와 toAddress가 같은지 체크
        var address = accountDecryption.address;
        if (address != toAddress) {
            console.log("ID 같지 않습니다.")
            callback(false);
        } else {
            console.log("ID 같습니다.")

            var privateKey = accountDecryption.privateKey;
            HomeChain.setProvider(web3.currentProvider);
            HomeChain.options.address = contractAddress;

            var transfer = HomeChain.methods.investBuilding(messageHash, v, r, s, toAddress, amount, position);
            var encodedABI = transfer.encodeABI();

            var tx = {
                from: address,
                to: contractAddress,
                gas: 6721975,
                data: encodedABI
            };

            web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
                var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

                tran.catch(function (error) {
                    console.log("investBuilding error");
                    console.log(error);
                    callback(false);
                });

                tran.on('confirmation', (confirmationNumber, receipt) => {
                    console.log('confirmation: ' + confirmationNumber);
                });

                tran.on('transactionHash', hash => {
                    console.log('hash');
                    console.log(hash);
                });

                tran.on('receipt', receipt => {
                    console.log('reciept');
                    console.log(receipt);
                    callback(true);
                });
            });
        }
    },

    useToken : function (accountEncryption, password, contractAddress, toAddress, amount, content, callback) {
        console.log('web3, useToken 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;
        var privateKey = accountDecryption.privateKey;
        HomeChain.setProvider(web3.currentProvider);
        HomeChain.options.address = contractAddress;

        var transfer = HomeChain.methods.useToken(toAddress, amount, content);
        var encodedABI = transfer.encodeABI();

        var tx = {
            from : address,
            to : contractAddress,
            gas : 6721975,
            data : encodedABI
        };

        web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
            var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

            tran.catch(function (error) {
                console.log("useToken error");
                console.log(error);
                callback(false);
            });

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
                callback(true);
            });
        });
    },

    registerBuildingCostructor : function (accountEncryption, password, contractAddress, buildingConstructor, callback) {
        console.log('web3, registerBuildingCostructor 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;
        var privateKey = accountDecryption.privateKey;

        HomeChain.setProvider(web3.currentProvider);
        HomeChain.options.address = contractAddress;

        var transfer = HomeChain.methods.registerBuildingCostructor(buildingConstructor);
        var encodedABI = transfer.encodeABI();

        var tx = {
            from : address,
            to : contractAddress,
            gas : 6721975,
            data : encodedABI
        };

        web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
            var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

            tran.catch(function (error) {
                console.log("registerBuildingCostructor error");
                console.log(error);
                callback(false);
            });

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
                callback(true);
            });
        });
    },

    checkInvestState : function (accountEncryption, password, contractAddress, callback) {
        console.log('web3, checkInvestState 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;

        HomeChain.setProvider(web3.currentProvider);
        HomeChain.options.address = contractAddress;

        HomeChain.methods.checkInvestState().call({
            from : address
        }, function (err, result) {
            if(err) {
                console.log(err);
                callback(err)
            }
            else {
                console.log('checkInvestState : ', result)
                callback(result)
            }
        })
    },

    checkUseTokenAmount : function (accountEncryption, password, contractAddress, callback) {
        console.log('web3, checkUseTokenAmount 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;

        HomeChain.setProvider(web3.currentProvider);
        HomeChain.options.address = contractAddress;

        HomeChain.methods.checkUseTokenAmount().call({
            from : address
        }, function (err, result) {
            if(err) {
                console.log(err);
                callback(err)
            }
            else {
                console.log('transactionLength : ', result)
                callback(result)
            }
        })
    },

    checkUseToken : function (accountEncryption, password, contractAddress, serial, callback) {
        console.log('web3, checkUseToken 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;

        HomeChain.setProvider(web3.currentProvider);
        HomeChain.options.address = contractAddress;

        HomeChain.methods.checkUseToken(serial).call({
            from : address
        }, function (err, result) {
            if(err) {
                console.log(err);
                callback(err)
            }
            else {
                console.log('transaction : ', result)
                callback(result)
            }
        })
    },

    checkMypageState : function (accountEncryption, password, contractAddress, callback) {
        console.log('web3, checkMypageState 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;

        HomeChain.setProvider(web3.currentProvider);
        HomeChain.options.address = contractAddress;

        HomeChain.methods.checkMypageState().call({
            from : address
        }, function (err, result) {
            if(err) {
                console.log(err);
                callback(err)
            }
            else {
                console.log('transaction : ', result)
                callback(result)
            }
        })
    }
};
function sendEther(address){
    web3.eth.sendTransaction({from: '0xA2417b690192b1E431ADe39A870aae0c4C05c11B', to:address, value: 10000000000000000, gasLimit: 6721975, gasPrice: 0})
}

//ccb192cbf9cf07287e90ac3cb0dca21b5a1d806b
// 실행하시오!!
// HomeChain.deploy({
//     data : bytecode,
// }).send({
//     from : "0x5b7C0779F2241bdf429803F0aB63F6948B5aD095",
//     gas : 6721975
// }).then(function (newContractInstance) {
//     console.log(newContractInstance.options.address);
//     contract_address = newContractInstance;
// })
// 100토큰 전달
// HomeChain.methods.transfer("0x22FA6ea1e3AfE958b06115291791d70f71377e64", 100).send({
//     from: "0x5b7C0779F2241bdf429803F0aB63F6948B5aD095",
//     gas: 6721975
// },function (err, result) {
//     if(err) console.log('error', err)
//     else{
//         console.log("destory",result);
//     }
// });
// HomeChain.methods.balanceOf("0x22FA6ea1e3AfE958b06115291791d70f71377e64").call({
//     from : "0x22FA6ea1e3AfE958b06115291791d70f71377e64"
// }, function (err, result) {
//     if(err) console.log(err);
//     else {
//         console.log('APP : ', result)
//     }
// })
// var newAccount = web3.eth.accounts.create();
// var address = newAccount.address;
// var privateKey = newAccount.privateKey;
// console.log("address : ", address);
// console.log("privateKey : ", privateKey);
// sendEther(address);

