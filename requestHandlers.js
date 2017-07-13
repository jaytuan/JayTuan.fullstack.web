var http = require('http');
var mysql = require('mysql');

var connection = mysql.createConnection({
		host:'localhost',
		port:'3306',
		user:'root',
		password:'123456',
		database:'myPro',
		//是否许一个query中有多个MySQL语句
		multipleStatements:true,
});
function searchNews(params,callback){
	var backData={status:200,data:[]};
	var param = decodeURIComponent(params.keyword);
	connection.query('SELECT * FROM NewsInformation WHERE NewsTotalContent LIKE "%'+param+'%" or NewsShortContent LIKE "%'+param+'%" or NewsTitle LIKE "%'+param+'%"',function(error,results,fields){
		if(error) throw error;
		backData.data = results;
		console.log(JSON.stringify(backData));
		callback(JSON.stringify(backData));
	});
};
function getNewsInfo(params,callback){
	var backData={status:200,data:[]};
	connection.query('SELECT * FROM NewsInformation',function(error,results,fields){
		if(error) throw error;
		backData.data = results;
		callback(JSON.stringify(backData));
	});
};
function delNews(params,callback){
	var backData={status:200,data:[]};
	connection.query('DELETE FROM NewsInformation WHERE ID in ('+params.ids+')',function(error,results,fields){
		if(error) throw error;
		backData.data = results;
		console.log(results);
		callback(JSON.stringify(backData));
	});
}
function multimeout(params,callback){
	var backData={status:200,data:[]};
	connection.query('UPDATE NewsInformation SET IsInUse = 0 WHERE ID in ('+params.invalidNewsId+')',function(error,results,fields){
		if(error) throw error;
		backData.data = results;
		console.log(results);
		callback(JSON.stringify(backData));
	});
}
function mulapprove(params,callback){
	var backData={status:200,data:[]};
	console.log(params);
	connection.query('UPDATE NewsInformation SET NewsStatus = 2 WHERE ID in ('+params.approveNewsId+')',function(error,results,fields){
		if(error) throw error;
		backData.data = results;
		console.log(results);
		callback(JSON.stringify(backData));
	});
}
function getNewsType(params,callback){
	var backData={status:200,data:[]};
	connection.query('SELECT * FROM NewsClassify;SELECT * FROM NewsCompany',function(error,results,fields){
		if(error) throw error;
		backData.data = results;
		callback(JSON.stringify(backData));
	});
}
function addNews(params,callback){
	var backData={status:200,data:[]};
	var nowTime = new Date().getTime();
	// var addSql =  'INSERT INTO NewsInformation(NewsTitle,NewsShortContent,CreateTime,IsInUse,Creater,NewsTotalContent,HotImg,HotContImg,Author,CompanyID,NewsType,LastModify,NewsStatus) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1)';
	//暂时去掉图片
	var addSql =  'INSERT INTO NewsInformation(NewsTitle,NewsShortContent,CreateTime,IsInUse,Creater,NewsTotalContent,Author,CompanyID,NewsType,LastModify,NewsStatus) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
	var addSqlParam = [params.NewsTitle,
					   params.NewsShortContent,
					   nowTime,
					   params.isInUse * 1,
					   params.Creater,
					   params.NewsTotalContent,
					   // params.HotImg?'/'+params.HotImg:params.HotImg,
					   // params.HotContImg?'/'+params.HotContImg:params.HotContImg,
					   params.Author,
					   params.CompanyID * 1,
					   params.newsType,
					   params.Creater,
					   //userLevel为管理员账户，新增以后不用审批直接状态为审批完成
					   params.userLevel == 1 ? 2 : 1];

	connection.query(addSql,addSqlParam,function(error,results,fields){
		if(error) throw error;
		backData.data = results;
		callback(JSON.stringify(backData));
	});
}
function updateNewsInfor(params,callback){
	var backData={status:200,data:[],result:false};
	var modSql = 'UPDATE NewsInformation SET NewsTitle = ?,NewsShortContent = ?,NewsTotalContent = ?,IsInUse=?,NewsType=?,LastModify=? WHERE Id = ?';
	var modSqlParams = [params.title,params.shortContent,params.content,params.isInUse,params.newsType,params.modifyer,params.id];
	connection.query(modSql,modSqlParams,function(error,results){
		if(error) throw error;
		backData.data = results;
		callback(JSON.stringify(backData));
	});
}
function loginSystem(params,callback){
	var backData={status:200,data:[],result:false};
	connection.query('SELECT * FROM BackCountTable where UserName="' + params.uname + '"' ,function(error,results,fields){
		if(error) throw error;
		backData.data = results;
		if(backData.data.length > 0 && backData.data[0].Passport == params.upwd){
			backData.result = true;
			backData.Msg = '密码正确';
			backData.MsgCode = 1001;
		}else if(backData.data.length == 0){
			backData.Msg = '该账户不存在';
			backData.MsgCode = 1002;
		}else if(backData.data.length > 0&& backData.data[0].Passport != params.upwd){
			backData.Msg = '密码与账户不匹配';
			backData.MsgCode = 1003;
		}
		callback(JSON.stringify(backData));
	});
};
//处理错误及重连
function handleDisconnect(connection) {
  connection.on('error', function(err) {
    if (!err.fatal) {
      return;
    }
    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      throw err;
    }
    connection = mysql.createConnection(connection.config);
    handleDisconnect(connection);
    connection.connect();
  });
}
handleDisconnect(connection);
exports.getNewsInfo = getNewsInfo;
exports.loginSystem = loginSystem;
exports.getNewsType = getNewsType;
exports.multimeout = multimeout;
exports.addNews = addNews;
exports.delNews = delNews;
exports.searchNews = searchNews;
exports.mulapprove = mulapprove;
exports.updateNewsInfor = updateNewsInfor;