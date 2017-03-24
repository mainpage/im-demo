var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 4000;

http.listen(port, function(){
	console.log('listen on port ' + port);
})

var socketMap = {},
    kefuList = [],
    userList = [],
    connectionCount = 0;
io.on('connection', function(socket){
    console.log('connection');
    connectionCount++;
    console.log('连接数: ' + connectionCount);
    socket.on('newUser', function(user){
	    console.log('new user');
	  	socketMap[user.id] = socket;
	  	userList.push(user);
	    var kefu = getById(kefuList, 'userId', user.id);
	    // 用户已有客服接待
	    if(!!kefu){
	    	// to user
	    	socket.emit('session', {kefu: kefu});
	    }else{
	    	kefu = getFreeKefu();
	    	if(!kefu){
	    		socket.emit('nokefu');
	    	}else{
	    		user.kefuId = kefu.id;
	    		kefu.userId = user.id;
		    	// to user
		    	socket.emit('session', {kefu: kefu});
		    	// to kefu
		    	socketMap[kefu.id].emit('session', {user: user});
	    	}
	    }
	});
	socket.on('newKefu', function(kefu){
	    console.log('new kefu');
	  	socketMap[kefu.id] = socket;
	    kefuList.push(kefu);
	    var user = getById(userList, 'kefuId', kefu.id);
	    if(!!user){
	    	// to kefu
	    	socket.emit('session', {user: user});
	    }
	});
  	socket.on('message', function(message){
	  	console.log(message);
	  	var to = message.to,
	        socketInstance = socketMap[to];
	  	socketInstance.emit('message', message);
    });
    socket.on('disconnect', function(data){
    	connectionCount--;
    	for(var key in socketMap){
    		if(socketMap[key] == socket){
    			delete socketMap[key];
    			// remove kefu from list
    			kefuList.forEach(function(kefu, index){
    				if(kefu.id == key){
    					kefuList.splice(index, 1);
    				}
    			})
    			console.log(kefuList);
    		}
    	}
    })
});

//util
/**
 * 根据id获取数组元素
 * @param  {array} arr
 * @param  {string} key
 * @param {string, number} value
 * @return {object}
 */
function getById(arr, key, value){
	for(var i = 0; i < arr.length; i++){
		var item = arr[i];
		if(item[key] == value){
			return item;
		}
	}
	return null;
};
/**
 * 获取空闲客服
 * @return {object} - 客服对象
 */
function getFreeKefu(){
	for(var i = 0; i < kefuList.length; i++){
		var kefu = kefuList[i];
		if(!kefu.userId){
			return kefu;
		}
	}
	return null;
	// 不能用forEach,注意回调函数里的return
	/*kefuList.forEach(function(kefu){
		console.log(kefu.userId);
		if(!kefu.userId){
			return kefu;
		}
	})
	return null;*/
}
