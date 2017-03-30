<template>
  <div class="g-main">
  	<div class="g-hd">
  		<h2>访客端</h2>
  	</div>
    <div class="g-bd">
    	<ul class="msg-list">
    		<li class="msg" v-for="msg in msgList" :class="{msg_right: id == msg.from}">
    			<span class="name" v-if="id != msg.from">{{msg.kefu.name}}</span>
          <div class="content">
            <span>{{msg.content}}</span>
          </div>
          <span class="name" v-if="id == msg.from">我</span>
    		</li>
    	</ul>
    	<div class="editor">
    		<textarea v-model="input" placeholder="请输入..." @keydown.enter.prevent @keyup.enter.prevent="send()"></textarea>
        <div class="action">
    		  <button class="send" @click="send()">发送</button>
        </div>
    	</div>
    </div>
  </div>
</template>

<style type="text/css" lang="scss">
  *{
    margin: 0;
    padding: 0;
    outline: none;
    font-family: Microsoft YaHei;
  }
	.g-main{
		width: 500px;
    margin: 20px auto;
	  box-shadow: 0 1px 5px 2px #ccc;
	}
	.g-hd{
		position: relative;
		width: 100%;
		height: 45px;
		color: #fff;
		line-height: 45px;
		font-size: 14px;
		background-color: #f16964;
	}
	.g-bd{
  }
  .msg-list{
    height: 300px;
    list-style: none;
    overflow: auto;
    .msg{
      margin: 10px 30px;
      text-align: left;
      .name{
        font-style: italic;
        font-size: 14px;
      }
      .content{
        display: inline-block;
        margin: 0 5px;
        padding: 6px 10px 7px 12px;
        color: #222;
        font-size: 14px;
        line-height: 1.5;
        border: 1px solid #e6e6e6;
        border-radius: 4px;
        background-color: #f7f7f7;
      }
    }
    .msg_right{
      text-align: right;
      .content{
        background-color: #f16964;
        color: #fff;
        border: none;
      }
    }
  }
  .editor{
    padding: 10px 10px 15px 10px;
    border-top: 1px solid #ccc;
    textarea{
      width: 100%;
      height: 58px;
      padding: 10px;
      border: none;
      font-size: 14px;
      resize: none;
      box-sizing: border-box;
      &:focus{
        border: none;
      }
    }
    .action{
      text-align: right;
    }
    .send{
      margin-right: 10px;
      padding: 10px 20px;
      border: 0;
      border-radius: 3px;
      font-size: 14px;
      color: #fff;
      background-color: #f16964;
      cursor: pointer;
    }
  }
</style>

<script>
import Rx from 'rx';
export default {
  name: 'user',
  data () {
    return {
    	id: 1123,
    	name: '一个年轻人',
    	kefu: {},
    	input: '',
      	msgList: []
    }
  },
  methods: {
  	initSocket() {
      this.socket = io.connect('localhost:4000');
      // bind event
      this.socket.on('session', (res) => {
        this.kefu = res.kefu;
        this.onSession();
      })
      this.socket.on('nokefu', () => {
        alert('nokefu');
      })
      // emit
      this.socket.emit('newUser', {
        id: this.id,
        name: this.name
      })
    },
    onSession() {
      let me = this;
      let httpMessage$ = Rx.Observable.from([{
        from: 1123,
        to: 917,
        content: '这是一条历史消息'
      }]);
      let wsMessage$ = Rx.Observable.create((observer) => {
        me.socket.on('message', (msg) => {
          observer.next(msg);
        })
      });
      let kefu$ = Rx.Observable.of(me.kefu);
      let message$ = httpMessage$.merge(wsMessage$)
      .combineLatest(kefu$)
      .map(data => {
        let [message, kefu] = data;
        return Object.assign({}, message, {kefu: kefu});
      });
      kefu$.subscribe((kefu) => {
        console.log(kefu)
      })
      message$.subscribe((message) => {
        me.msgList.push(message);
      })
    },
  	send() {
  		if(!this.kefu.id || !this.input) return;
  		let msg = {
  			content: this.input,
  			from: this.id,
  			to: this.kefu.id
  		};
  		this.msgList.push(msg);
  		this.socket.emit('message', msg);
  		this.input = '';
  	}
  },
  created() {
  	this.initSocket();
  }
}
</script>
