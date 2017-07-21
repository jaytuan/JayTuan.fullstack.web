$(document).ready(function(){
	pageInit();
	
});
var pageInit = function(){
	$('.reset_btn').on('click',function(){
		$('.login_info .login_username').val('');
		$('.login_info .login_pwd').val('');
	});
	$('.login_btn').on('click',function(){
		var uname = $('.login_info .login_username').val();
		var upwd = $('.login_info .login_pwd').val();
		para = 'uname='+ $.trim(uname) +'&upwd='+ $.trim(upwd);
		$.ajax({
			url:'/loginSys.ashx?'+ para,
			dataType:'jsonp',
			jsonpCallback:"success_jsonpCallback",
			success:function(backData){
					console.log(backData);
				if(backData.status == 200 && backData.result && backData.MsgCode == 1001 ){
					//登录成功
					var cookieInfo = 'username='+backData.data[0].UserName;
						cookieInfo += '&pwd='+backData.data[0].Passport;
						cookieInfo += '&nickName='+backData.data[0].NickName;
						cookieInfo += '&level='+backData.data[0].AuthorityLevel;
					var expiresDate = new Date();
						expiresDate.setTime(expiresDate.getTime()+60*60*1000);
					setCookie("jNewsLoginState", cookieInfo,expiresDate);
					window.location.href = "/pages/backOperation.html";
				}else if(backData.MsgCode == 1002 || backData.MsgCode == 1003){
					//1002 账户不存在   1003密码不正确
					$('.err_infor').html(backData.Msg).show();
				}else{
					$('.err_infor').html("程序崩溃啦，快去提bug").show();
				}
			},
			error:function(){
					$('.err_infor').html("程序崩溃啦，快去提bug").show();
			}
		})
	});
	var userInfo =  getUserName();
	if(userInfo.length>0){
		window.location.href = '/pages/backOperation.html';
	}
};
var getUserName = function(){
	//cookie key 
	var userInfo = [];
	var userInfoArr = [];
	var cookieArr = document.cookie.split(';');
	for(var i=0; i<cookieArr.length;i++){
		var cookieInfo = cookieArr[i];
		if(cookieInfo.indexOf('jNewsLoginState') > -1){
			userInfoArr = cookieInfo.substr(cookieInfo.indexOf('username=')).split('&');
			//"username=root&pwd=liuxiaojian521.&nickName=Jay调我想要&level=1"
			//数组[root,liuxiaojian521.,Jay调我想要,1]
			break;
		}	
	}
	for(var i=0 ; i<userInfoArr.length ; i++){
		var str = userInfoArr[i];
		userInfo.push(str.split('=')[1]);
	}
	return userInfo;
}
var setCookie = function(name,key,expiresdays){
		document.cookie = name + '=' + key + (expiresdays?';path=/' : ';expires='+expiresdays.toGMTString() + ';path=/');
		
}
