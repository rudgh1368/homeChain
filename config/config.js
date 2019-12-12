module.exports = {
    server_port: 3000,
    db_url: 'mongodb://localhost:27017/local',
    jsonrpc_api_path : '/api',
    db_schemas: [
        {file:'./user_schema', collection:'hncUsers', schemaName:'UserSchema', modelName:'UserModel'},
        {file:'./post_schema', collection:'hncPosts', schemaName:'PostSchema', modelName:'PostModel'}
    ],
    route_info: [
        //===== post =====//
        {file:'./post', path:'/addpost', method:'addpost', type:'get'},
        {file:'./post', path:'/addpost/write', method:'write', type:'post'},
        {file:'./post', path:'/showpost/:id', method:'showpost', type:'get'},
        {file:'./post', path:'/listpost', method:'listpost', type:'get'},
        {file:'./post', path:'/showpost/download/:id', method:'download', type:'get'},
        //===== mypage =====//
        {file:'./mypage', path:'/mypage', method:'mypage', type:'get'},
        //===== transaction History =====//
        {file:'./transactionHistory', path:'/transactionHistory/:id', method:'transactionHistory', type:'get'},

        {file:'./createToken', path:'/createToken', method:'createToken', type:'get'},
        {file:'./createToken', path:'/createToken/create', method:'create', type:'post'},
        {file:'./registerToken', path:'/registerToken', method:'registerToken', type:'get'},
        {file:'./registerToken', path:'/registerToken/register', method:'register', type:'post'},
        {file:'./useToken', path:'/useToken/:id', method:'useToken', type:'get'},
        {file:'./useToken', path:'/useToken/:id/use', method:'use', type:'post'},
        {file:'./registerConstructor', path:'/registerConstructor', method:'registerConstructor', type:'get'},
        {file:'./registerConstructor', path:'/registerConstructor/register', method:'register', type:'post'},

        {file:'./test', path:'/test', method : 'test', type : 'get'}
    ]
}