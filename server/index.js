let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let port = process.env.PORT || 4000;

http.listen(port, function(){
	console.log('listen on port ' + port);
})

let socketMap = {},
    kefuList = [],
    userList = [],
    connectionCount = 0;
io.on('connection', function(socket){
    console.log('connection');
    connectionCount++;
    console.log('连接数: ' + connectionCount);
    socket.on('newUser', onNewUser.bind(this, socket));
	socket.on('newKefu', onNewKefu.bind(this, socket));
  	socket.on('message', onMessage);
    socket.on('disconnect', onDisconnect.bind(socket));
});

/**
 * 新访客
 * @param  {object} socket 
 * @param  {object} user  
 * @return {void} 
 */
function onNewUser(socket, user){
    console.log('new user');
    socket.fromType = 'user';
  	socketMap[user.id] = socket;
  	userList.push(user);
    let kefu = kefuList.find((kefu) => {
    	return kefu.userId == user.id
    });
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
};
/**
 * 新客服
 * @param  {object} socket 
 * @param  {object} kefu 
 * @return {void}
 */
function onNewKefu(socket, kefu){
	console.log('new kefu');
	socket.fromType = 'kefu';
	socketMap[kefu.id] = socket;
	kefuList.push(kefu);
	let user = userList.find((user) => {
		return user.kefuId == kefu.id;
	})
	if(!!user){
		// to kefu
		socket.emit('session', {user: user});
	}
};
/**
 * 收到消息
 * @param  {object} message 
 * @return {void} 
 */
function onMessage(message){
	console.log(message);
	let to = message.to,
      socketInstance = socketMap[to];
	socketInstance.emit('message', message);
};
/**
 * 连接断开
 * @param  {object} socket 
 * @return {void} 
 */
function onDisconnect(socket){
	console.log('disconnect');
	connectionCount--;
	Object.keys(socketMap).forEach((key) => {
		if(socketMap[key] == socket){
			delete socketMap[key];
			// remove kefu or user from list
			let list = socket.fromType == 'user' ? userList : kefuList;
			let index = list.findIndex((item) => {
				item.id == key;
			})
			if(index > -1){
				list.splice(index, 1);
			}
		}
	})
};

/*****************util*****************/

/**
 * 获取空闲客服
 * @return {object} - 客服对象
 */
function getFreeKefu(){
	for(let i = 0; i < kefuList.length; i++){
		let kefu = kefuList[i];
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
