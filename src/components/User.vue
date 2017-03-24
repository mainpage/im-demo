<template>
  <div class="g-main">
  	<div class="g-hd">
  		<h2>访客端</h2>
  	</div>
    <div class="g-bd">
    	<ul class="msg-list">
    		<li class="item" v-for="msg in msgList" :class="{msg_right: id == msg.from}">
    			<div class="content">
            <span>{{msg.content}}</span>
          </div>
    		</li>
    	</ul>
    	<div class="editor">
    		<textarea v-model="input"></textarea>
        <div class="action">
    		  <button class="send" @click="send()">发送</button>
        </div>
    	</div>
    </div>
  </div>
</template>

<style type="text/css" lang="postcss">
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
  }
  .item{
    margin: 10px 30px;
    text-align: left;
  }
  .content{
    display: inline-block;
    padding: 10px 10px 12px 12px;
    color: #222;
    font-size: 14px;
    line-height: 1.5;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    background-color: #f7f7f7;
  }
  .msg_right{
    text-align: right;
  }
  .editor{
    padding: 10px;
    border-top: 1px solid #ccc;
  }
  textarea{
    width: 100%;
    height: 78px;
    padding: 10px;
    border: none;
    font-size: 14px;
    resize: none;
    box-sizing: border-box;
  }
  textarea:focus{
    border: none;
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
</style>

<script>
export default {
  name: 'user',
  data () {
    return {
    	id: 1123,
    	name: 'sch',
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
  		})
  		this.socket.on('nokefu', () => {
  			alert('nokefu');
  		})
  		this.socket.on('message', (msg) => {
  			this.msgList.push(msg);
  		})
  		// emit
  		this.socket.emit('newUser', {
  			id: this.id,
  			name: this.name
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
