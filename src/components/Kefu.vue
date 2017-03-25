<template>
  <div class="g-main">
  	<div class="g-hd">
  		<h2>客服端</h2>
  	</div>
    <div class="g-bd">
    	<ul class="msg-list">
    		<li class="msg" v-for="msg in msgList" :class="{msg_right: id == msg.from}">
    			<span class="name" v-if="id != msg.from">{{user.name}}</span>
          <div class="content">
            <span>{{msg.content}}</span>
          </div>
          <span class="name" v-if="id == msg.from">我</span>
    		</li>
    	</ul>
    	<div class="editor">
    		<textarea v-model="input" placeholder="请输入..."></textarea>
        <div class="action">
          <button class="send" @click="send()">发送</button>
        </div>
    	</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'kefu',
  data () {
    return {
    	id: 917,
    	name: '一位长者',
    	user: {},
    	input: '',
      	msgList: []
    }
  },
  methods: {
  	initSocket() {
  		this.socket = io.connect('localhost:4000');
  		// bind event
  		this.socket.on('session', (res) => {
  			this.user = res.user;
  		})
  		this.socket.on('message', (msg) => {
  			this.msgList.push(msg);
  		})
  		// emit
  		this.socket.emit('newKefu', {
  			id: this.id,
  			name: this.name
  		})
  	},
  	send() {
      if(!this.user.id || !this.input) return;
  		let msg = {
  			content: this.input,
  			from: this.id,
  			to: this.user.id
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
