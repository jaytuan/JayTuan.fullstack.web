$(document).ready(function(){
	pageInit();
	pageHandler.bind();
});
var baseData = {
	newsType:{},
	newsCom:{},
	userName:'',
	nickName:'',
	userLevel:'',
	newsInforOrigin:[],
	isAlterNewsDetail:false,
	timeOutNews:[],
	needApprovedNews:[],
	approvingData:[],
}
var pageHandler={
	bind:function(){
		//头部tab切换
		$(".content_menu li:not(.jump_to_user)").on('click',function(){
			var elem = $(this);
			if(!elem.hasClass('current')){
				var elemClass = elem[0].className;
				$('.content_menu li:not(.'+ elemClass +')').removeClass('current');
				$('.item').removeClass('none');
				$('.item:not(.'+ elemClass +')').addClass('none');
				$(this).addClass('current');
				if(elemClass == 'approve'){
					pageHandler.renderApproveNews();
				}else if(elemClass == 'checking'){
					pageHandler.renderApprovingNews();
				}else if(elemClass == 'timeout'){
					pageHandler.renderTimeoutNews();
				}
			}
		});
		//确认发布新闻按钮
		$('.publish_news .submit_btn').on('click',function(){
			if(pageHandler.checkHasFill()){
				var para = '';
				para += 'NewsTitle='+$('.publish_news .newsTitle').val().trim();
				para += '&NewsShortContent='+$('.publish_news .newsSipIntro').val().trim(),
				para += '&isInUse='+($('#inUse').attr("checked") == "checked" ? 1 : 0);
				para += '&NewsTotalContent='+$('.publish_news .newsContent').val().trim();
				para += '&Author='+$('.publish_news .authorName').val().trim();
				para += '&CompanyID='+$('.publish_news .companyName').val().trim();
				para += '&newsType='+$('.publish_news .newsType').val().trim();
				para += '&Creater='+$('.publish_news .creater').val().trim();
				para += '&userLevel=' + baseData.userLevel;//账户权限等级
				console.log(para);
				$.ajax({
					url:'/addNews.ashx?'+para,
					dataType:'jsonp',
					jsonpCallback:"success_jsonpCallback",
					success:function(backData){
							console.log(backData);
							if(backData.data.affectedRows){
								pageHandler.msgwin({
									Content:baseData.userLevel==1?'尊敬的管理员，已经为您发布新闻，您可以到“已发布”标签下查看':'新增成功，请静待审批',
									btns:[
											{
												"btnName":'现在查看',
												"btnClassName":'toCheck',
												"_callback":function(){
													window.location.reload();
												}
											},
											{
												"btnName":'知道了',
												"btnClassName":'Iknow',
												"_callback":function(){
													$('.pop_Msg .closeBtn').click();
												}
											}
										]
								});
							}
					},
					error:function(backData){
						console.log(backData);
					},
				});	
			}else{
				pageHandler.msgwin({
					Content:'请填写完整必填项',
				});
			}
		});
		//全选控制
		$('#published_select_all').change(function(){
			if($(this).is(':checked')){
				$('.published .published_board input.newsCheckbox:not(":checked")').click();
			}else{
				$('.published .published_board input.newsCheckbox:checked').click();
			}
		});	
		//批量无效操作
		$('.published .multimeout').on('click',function(){
			var checkedNews = $('.published .published_board input.newsCheckbox:checked');
			var invalidNewsId = [];
			for(var i = 0;i < checkedNews.length;i++){
				invalidNewsId.push($(checkedNews[i]).attr('_id')*1);
			}
			if(invalidNewsId.length){
				$.ajax({
					url:'/multimeout.ashx?invalidNewsId=' + invalidNewsId,
					dataType:'jsonp',
					jsonpCallback:"success_jsonpCallback",
					success:function(backData){
						if(backData.data.affectedRows > 0){
							pageHandler.msgwin({
								Content:'批量无效成功',
								btns:[
										{
											"btnName":'好的',
											"btnClassName":'OK',
											"_callback":function(){
												$('.pop_Msg .closeBtn').click();
												window.location.reload();
											}
										}
									]
							});
						}else{
							pageHandler.msgwin({
								Content:'批量无效失败请重试',
								btns:[
										{
											"btnName":'好的',
											"btnClassName":'OK',
											"_callback":function(){
												$('.pop_Msg .closeBtn').click();
											}
										}
									]
							});
						}
					},
					error:function(backData){
						pageHandler.msgwin({
							Content:'批量无效失败请重试',
							btns:[
									{
										"btnName":'好的',
										"btnClassName":'OK',
										"_callback":function(){
											$('.pop_Msg .closeBtn').click();
										}
									}
								]
						});
					},
				});
			}else{
				pageHandler.msgwin({
					Content:'没有选中有效的新闻',
					btns:[
							{
								"btnName":'好的',
								"btnClassName":'OK',
								"_callback":function(){
									$('.pop_Msg .closeBtn').click();
								}
							}
						]
				});
			}
		});
	},
	bindTimeout:function(){
		//全选控制
		$('#timeout_select_all').change(function(){
			if($(this).is(':checked')){
				$('.timeout .published_board input.newsCheckbox:not(":checked")').click();
			}else{
				$('.timeout .published_board input.newsCheckbox:checked').click();
			}
		});
		//批量删除按钮
		$('.timeout .multiDel').on('click',function(){
			var checkedNews = $('.timeout .published_board input.newsCheckbox:checked');
			var delNewsId = [];
			for(var i = 0;i < checkedNews.length;i++){
				delNewsId.push($(checkedNews[i]).attr('_id')*1);
			}
			pageHandler.delNews(delNewsId);
		});
		//删除按钮
		$('.timeout .op_cell .del_btn').on('click',function(){
			var _id = [];
			_id.push($(this).attr('_id')*1);
			pageHandler.delNews(_id);
		});
	},
	//绑定审批页
	bindApprove:function(){
		//全选控制
		$('#approve_select_all').change(function(){
			if($(this).is(':checked')){
				$('.approve .published_board input.newsCheckbox:not(":checked")').click();
			}else{
				$('.approve .published_board input.newsCheckbox:checked').click();
			}
		});
		//批量通过操作
		$('.approve .mul_approve').on('click',function(){
			var checkedNews = $('.approve .published_board input.newsCheckbox:checked');
			var approveNewsId = [];
			for(var i = 0;i < checkedNews.length;i++){
				approveNewsId.push($(checkedNews[i]).attr('_id')*1);
			}
			if(approveNewsId.length){
				pageHandler.multiApprove(approveNewsId,function(backData){
						if(backData.data.affectedRows > 0){
							pageHandler.msgwin({
								Content:'批量审批成功完成',
								btns:[
										{
											"btnName":'好的',
											"btnClassName":'OK',
											"_callback":function(){
												$('.pop_Msg .closeBtn').click();
												window.location.reload();
											}
										}
									]
							});
						}else{
							pageHandler.msgwin({
								Content:'批量审批失败，请重试',
								btns:[
										{
											"btnName":'好的',
											"btnClassName":'OK',
											"_callback":function(){
												$('.pop_Msg .closeBtn').click();
											}
										}
									]
							});
						}
					},function(backData){
						pageHandler.msgwin({
							Content:'批量无效失败请重试',
							btns:[
									{
										"btnName":'好的',
										"btnClassName":'OK',
										"_callback":function(){
											$('.pop_Msg .closeBtn').click();
										}
									}
								]
						});
					});
			}else{
				pageHandler.msgwin({
					Content:'没有选中有效的新闻',
					btns:[
							{
								"btnName":'好的',
								"btnClassName":'OK',
								"_callback":function(){
									$('.pop_Msg .closeBtn').click();
								}
							}
						]
				});
			}
		});
		//通过操作
		$('.approve .approveBtn').on('click',function(){
			var approveNewsId = [];
			var thisId = $(this).attr('_id')*1;
			approveNewsId.push(thisId);
			pageHandler.multiApprove(approveNewsId,function(backData){
					if(backData.data.affectedRows > 0){
						pageHandler.msgwin({
							Content:'审批成功完成',
							btns:[
									{
										"btnName":'好的',
										"btnClassName":'OK',
										"_callback":function(){
											$('.pop_Msg .closeBtn').click();
											for(var i =0;i<baseData.needApprovedNews.length;i++){
												if(thisId == baseData.needApprovedNews[i].ID){
													baseData.needApprovedNews.splice(i,1);
													break;
												}
											}
											pageHandler.renderApproveNews();
										}
									}
								]
						});
					}else{
						pageHandler.msgwin({
							Content:'审批失败,请重试',
							btns:[
									{
										"btnName":'好的',
										"btnClassName":'OK',
										"_callback":function(){
											$('.pop_Msg .closeBtn').click();
										}
									}
								]
						});
					}
				},function(backData){
					pageHandler.msgwin({
						Content:'审批失败,请重试',
						btns:[
								{
									"btnName":'好的',
									"btnClassName":'OK',
									"_callback":function(){
										$('.pop_Msg .closeBtn').click();
									}
								}
							]
					});
				});
		});
	},
	msgwin:function(obj){
		//OBJ{title,content,btns[{"btnName":'',"btnClassName":'',_callback:"回调函数"},{"btnname":'',"btnClassName":'',_callback:"回调函数"}],回调函数与btn顺序对应}不传btns默认btn只一个
		//title不传的话默认温馨提示
		if(typeof(obj)=='object'){
			var msgTxt = doT.template($("#popWin").html());
            $(".pop_Msg").html(msgTxt(obj));
            $(".pop_Msg").removeClass('none');
			$('.pop_Msg .closeBtn').on('click',function(){
	            $(".pop_Msg").addClass('none');
			});
            if(obj.btns&&obj.btns.length){
            	for(var i = 0;i<obj.btns.length;i++){
            		var btn = obj.btns[i];
            		$('.'+btn.btnClassName).on('click',btn._callback);
            	}
            }else{
        		$('.known').on('click',function(){
        			$('.pop_Msg .closeBtn').click();
        		});
            }
		}
	},
	checkHasFill:function(){
		var hasFilled = true;
		var requiredArr = $('#addNews [required]');
		for(var i=0;i<requiredArr.length;i++){
			if(!requiredArr[i].value){
				hasFilled = false;
				break;
			}
		}
		return hasFilled;
	},
	checkUserLevel:function(){
		var userInfo = getUserName();
		if(userInfo.length){
			$('.item.published').removeClass('none');
			//有长度，即代表已经登录
			baseData.userName = userInfo[0];
			baseData.nickName = userInfo[2];
 			baseData.userLevel = userInfo[3];
			$('.top_logout a:first').text(baseData.nickName);
			$('.publish_news .creater').val(baseData.nickName );
			$('.top_logout').removeClass('none');
			if(userInfo[3] == 1){
				//管理员账户
				$('.content_menu .checking').css('display','none');
			}else{
				//普通账户
				//如果创建者跟当前账户一致则存到正在审核数据
				for(var i=0;i<baseData.needApprovedNews.length;i++){
					var approvingNews = baseData.needApprovedNews[i];
					if(approvingNews.Creater == baseData.nickName){
						baseData.approvingData.push(approvingNews);
					}
				}
				$('.content_menu .approve').css('display','none');
			}
			pageGetData.getNewsType();
			$('.logout').on('click',function(){
				pageHandler.delCookie();
				window.location.reload();
			});
		}else{
			$('.top_login').removeClass('none');
			window.location.href = "/pages/backLogin.html";
		}
	},
	renderApproveNews:function(index){
		var showNews = [];
		if(!index){
			index = 1;
		}
		if(baseData.needApprovedNews.length){
			//根据分页页码筛选出要渲染的数据
			showNews = baseData.needApprovedNews.slice((index-1)*8,index*8);
			var needApproveTxt = doT.template($('#needApproveNewsList').html());
		    $('.need_approve_news_list').html(needApproveTxt(showNews));
			pageHandler.renderPages(index,'approve','pageHandler.renderApproveNews');
			pageHandler.bindApprove();
		}else{
			$('.item.approve').html('<span class="nullData">还没有需要您审核的新闻</span>')
		}
	},
	renderApprovingNews:function(index){
		var showNews = [];
		if(!index){
			index = 1;
		}
		if(baseData.approvingData.length){
			//根据分页页码筛选出要渲染的数据
			showNews = baseData.approvingData.slice((index-1)*10,index*10);
			var needApprovingTxt = doT.template($('#ApprovingNewsList').html());
			$('.approving_news_list').html(needApprovingTxt(showNews));
			pageHandler.renderPages(index,'checking','pageHandler.renderApprovingNews');
		}else{
			$('.item.checking').html('<span class="nullData">您没有等待审核的新闻</span>')
		}
	},
	renderTimeoutNews:function(index){
		var showNews = [];
		if(!index){
			index = 1;
		}
		if(baseData.timeOutNews.length){
			//根据分页页码筛选出要渲染的数据
			showNews = baseData.timeOutNews.slice((index-1)*10,index*10);
			var timeoutTxt = doT.template($('#timeoutNewsList').html());
			$('.timeout .news_list').html(timeoutTxt(showNews));
			pageHandler.renderPages(index,'timeout','pageHandler.renderTimeoutNews');
			pageHandler.bindTimeout();
		}else{
			$('.item.timeout').html('<span class="nullData">暂时没有过期的新闻</span>')
		}
	},
	multiApprove:function(param,successCallback,errorCallback){
		$.ajax({
					url:'/mulapprove.ashx?approveNewsId=' + param,
					dataType:'jsonp',
					jsonpCallback:"success_jsonpCallback",
					success:successCallback,
					error:errorCallback,
				});
	},
	//退出登陆删除cookie
	delCookie : function(){
		var expDate = new Date();
		expDate.setTime(expDate.getTime()-10000);
		var cookieDataArr = document.cookie.split(';');
		for(var i=0;i<cookieDataArr.length;i++){
			var dataArray = cookieDataArr[i];
			if(dataArray.indexOf('jNewsLoginState') > -1){
				document.cookie = 'jNewsLoginState="";path=/;expires='+expDate.toGMTString();
			}
		}
	},
	//渲染分页 ,tabName为需要渲染的tab页类名 分别为published,checking,approve,timeout,
	//renderFunction 为分页点击某一页时调的方法名
	renderPages:function(nowIndex,tabName,renderFunction){
		var renderData = baseData.newsInforOrigin;
		if(tabName=='checking'){
			renderData = baseData.approvingData;
		}else if(tabName=='approve'){
			renderData = baseData.needApprovedNews;
		}else if(tabName=='timeout'){
			renderData = baseData.timeOutNews;
		}
		var totalIndex = Math.ceil(renderData.length/10);
		var data = {
			total:totalIndex,
			now: nowIndex,
			fenyeRenderFunction:renderFunction,
		}
		var fenyeTxt = doT.template($('#fenye').html());
		$('.'+tabName+' .fenye').html(fenyeTxt(data));
	},
	//渲染已发布新闻列表
	renderPublishedNewsList:function(index){
		if($('#published_select_all').is(':checked')){
			$('#published_select_all').click();
		}
		if(!index){
			index = 1;
		}
		//根据分页页码筛选出要渲染的数据
		var showNews = baseData.newsInforOrigin.slice((index-1)*10,index*10);
		var listTxt = doT.template($('#publishedNewsList').html());
		$('.published .news_list').html(listTxt(showNews));
		pageHandler.renderPages(index,'published','pageHandler.renderPublishedNewsList');
		pageHandler.bindRenderPublished();
	},
	//绑定已发布渲染后的新闻列表
	bindRenderPublished:function(){
		//绑定查看详情和点击标题展示详情
		$('.published_board .news_list .title_cell,.getDetail_btn').on('click',function(){
			var news = pageGetData.lookForWhichNews($(this).attr('_id'));
			var newsDetailTxt = doT.template($('#NewsInforDetail').html());
			$('.pop_NewsInforDetail').html(newsDetailTxt(news)).removeClass('none');
			var data = {
				origin:baseData.newsType,
				selected:news.NewsType,
			};
			var newsTypeTxt = doT.template($('#detailNewsType').html());
			$('.pop_NewsInforDetail .newsType').html(newsTypeTxt(data));
			$('.pop_NewsInforDetail p input:disabled').css('background','#fff');
			$('.pop_NewsInforDetail .closeBtn').on('click',function(){
	            $(".pop_NewsInforDetail").addClass('none');
			});
			//绑定检查是否有内容改变
			$('.pop_NewsInforDetail .Title,.pop_NewsInforDetail .short_content,.pop_NewsInforDetail .all_content,.pop_NewsInforDetail .is_usable,.pop_NewsInforDetail .newsType').on('change',function(){
				baseData.isAlterNewsDetail = true;
			});
			$('.pop_NewsInforDetail .alterBtn').on('click',function(){
				if(baseData.isAlterNewsDetail){
					var alterData = '';
						alterData +='title=' + $('.pop_NewsInforDetail .Title').val().trim();
						alterData +='&shortContent=' + $('.pop_NewsInforDetail .short_content').val().trim();
						alterData +='&content=' + $('.pop_NewsInforDetail .all_content').val().trim();
						alterData +='&isInUse=' + $('.pop_NewsInforDetail .is_usable').val().trim() * 1;
						alterData +='&newsType=' + $('.pop_NewsInforDetail .newsType').val().trim();
						alterData +='&modifyer=' + baseData.nickName;
						alterData +='&id=' + $(this).attr('_id') * 1;
					$.ajax({
						url:'/updateNewsInfor.ashx?'+alterData,
						dataType:'jsonp',
						jsonpCallback:"success_jsonpCallback",
						success:function(backData){
							if(backData && backData.data.affectedRows == 1){
								pageHandler.msgwin({
									Content:'恭喜你修改成功',
									btns:[
											{
												"btnName":'好的',
												"btnClassName":'OK',
												"_callback":function(){
													$('.pop_Msg .closeBtn').click();
													window.location.reload();
												}
											}
										]
								});
							}else{
								pageHandler.msgwin({
									Content:'修改失败请重试',
									btns:[
											{
												"btnName":'好的',
												"btnClassName":'OK',
												"_callback":function(){
													$('.pop_Msg .closeBtn').click();
												}
											}
										]
								});
							}
						},
						error:function(backData){
							console.log(backData);
						},
					});
				}else{
					pageHandler.msgwin({
						Content:'您没有对新闻信息做改动，请改动后再来',
						btns:[
								{
									"btnName":'好的',
									"btnClassName":'OK',
									"_callback":function(){
										$('.pop_Msg .closeBtn').click();
									}
								}
							]
					});
				}
			});
		});
		$('.published .published_board .del_btn').on('click',function(){
			var delDataId = [];
			delDataId.push($(this).attr('_id') * 1);
			pageHandler.delNews(delDataId);
		});
	},
	//删除新闻函数，尝试多条删除，传递数组过来，删单条就数组就一个id
	delNews:function(ids){
		$.ajax({
			url:'/delNews.ashx?ids='+ids,
			dataType:'jsonp',
			jsonpCallback:"success_jsonpCallback",
			success:function(backData){
				console.log(backData);
				if(backData && backData.data.affectedRows>0){
					pageHandler.msgwin({
						Content: ids.length > 1 ? '批量删除成功' : '删除成功',
						btns:[
								{
									"btnName":'好的',
									"btnClassName":'OK',
									"_callback":function(){
										$('.pop_Msg .closeBtn').click();
										window.location.reload();
									}
								}
						]
					});
				}else{
					pageHandler.msgwin({
						Content:'删除失败，请稍后重试',
						btns:[
								{
									"btnName":'好的',
									"btnClassName":'OK',
									"_callback":function(){
										$('.pop_Msg .closeBtn').click();
									}
								}
						]
					});
				}
			},
			error:function(backData){
				pageHandler.msgwin({
						Content:'删除失败，请稍后重试',
						btns:[
								{
									"btnName":'好的',
									"btnClassName":'OK',
									"_callback":function(){
										$('.pop_Msg .closeBtn').click();
									}
								}
						]
				});	
			},
		});
	}
}
var pageGetData = {
	getNewsType:function(){
		$.ajax({
			url:'/getNewsType.ashx',
			dataType:'jsonp',
			jsonpCallback:"success_jsonpCallback",
			success:function(backData){
				if(backData.data.length){
					baseData.newsType = backData.data[0];
					baseData.newsCom = backData.data[1];
					console.log(backData.data);
					console.log(backData.data.length);
					 var newsTypeTxt = doT.template($("#newsTypeSelect").html());
                     $(".publish_news .newsType").html(newsTypeTxt(backData.data[0]));
					 var newsComTxt = doT.template($("#newsComSelect").html());
                     $(".publish_news .companyName").html(newsComTxt(backData.data[1]));
				}
			},
			error:function(backData){
				console.log(backData);
			},
		});
	},
	getPublishedNews:function(){
		$.ajax({
			url:"/getNewsInfoList.ashx",
			type:"get",
			dataType:"jsonp",
			jsonpCallback:"success_jsonpCallback",
			success:function(data){
				if(data.status == 200 && data.data && data.data.length > 0){
					baseData.newsInforOrigin = data.data;
					baseData.newsInforOrigin.sort(function(a,b){
						return b.CreateTime - a.CreateTime;
					});

					for (var i = 0;  i < baseData.newsInforOrigin.length ; i++) {
						var news = baseData.newsInforOrigin[i];
						var cteateTime = new Date(news.CreateTime*1)
						var timeStr = '';
						timeStr += cteateTime.getFullYear()+'.';
						timeStr += (cteateTime.getMonth() + 1 )+'.';
						timeStr += cteateTime.getDate()+' ';
						timeStr += cteateTime.getHours()+':';
						timeStr += cteateTime.getMinutes() > 9 ? cteateTime.getMinutes() : ('0'+cteateTime.getMinutes());
						news.timeStr = timeStr;
						if(news.NewsTitle.length>30){
							news.NewsShortTitle = news.NewsTitle.slice(0,30)+'...';
						}
						//待审批且有效的新闻，root权限可以审批
						if(news.NewsStatus == 1 && news.IsInUse == 1){
							if(news.NewsShortContent.length>60){
								news.shortSummary = news.NewsShortContent.slice(0,60)+'...';
							}
							baseData.needApprovedNews.push(news);
						}
						//过期新闻存放
						if(news.IsInUse == 0){
							baseData.timeOutNews.push(news);
						}
					};					
				}
				pageHandler.renderPublishedNewsList();
				pageHandler.checkUserLevel();
			},
			error:function(data){
				console.log(data);
			}
		});
	},
	lookForWhichNews:function(id){
		for(var i = 0 ; i < baseData.newsInforOrigin.length ; i++){
			var news = baseData.newsInforOrigin[i];
			if(news.ID == id){
				return news;
			}
		}
	}
}
var pageInit = function(){
	pageGetData.getPublishedNews();
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
