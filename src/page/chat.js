import {inject, bindingMode} from 'aurelia-framework';
import {Endpoint} from 'aurelia-api';
import {DialogService} from 'aurelia-dialog';
import {Router} from 'aurelia-router';
import {Modal} from '../component/modal';
import {users} from '../lib/resources';

@inject(Endpoint.of('api'), DialogService, Router)
export class ChatScreen {
  conversations;
  activeChat          = {};
  user;
  participants;
  message             = '';
  offset              = 0;
  messages            = [];
  users               = {};
  hasPreviousMessages = false;

  constructor(api, dialog, router) {
    this.api    = api;
    this.dialog = dialog;
    this.router = router;
  }

  activate() {
    this.user = JSON.parse(localStorage.getItem('user'));

    this.mapUsers();

    this.fetchConversations();
  }

  fetchConversations() {
    this.api.request('GET', `conversation/user/${this.user.id}`)
      .then(response => {
        this.conversations = response.filter(item => {
          return item.users.length !== 0 && item.conversation.name;
        });
      })
      .catch(console.error);
  }

  openModal() {
    this.dialog.open({viewModel: Modal, model: {title: 'Create new group', user: this.user}})
      .whenClosed(response => {
        if (response.wasCancelled) {
          return;
        }

        response.output.users = response.output.users.join(',');

        this.api.request('POST', 'conversation/group', response.output)
          .then(this.fetchConversations())
          .catch(console.error);
      });
  }

  mapUsers() {
    return users.forEach(user => this.users[user.id] = user.name);
  }

  getParticipantNames(users) {
    let names = [];

    users.forEach(user => {
      if (user.userid === this.user.id || !this.users[user.userid]) {
        return;
      }

      const userName = this.users[user.userid];

      return names.push(userName);
    });

    if (!names.length) {
      return 'You';
    }

    return `You, ${names.join(', ')}`;
  }

  openChat(data) {
    let conversationId = data.conversation.conversationId;

    if (conversationId === this.activeChat.conversationId) {
      return;
    }

    this.activeChat   = data.conversation;
    this.offset       = 0;
    this.messages     = [];
    this.participants = [];
    this.participants = this.getParticipantNames(data.users);

    this.fetchMessages(conversationId)
      .then(() => this.api.request('PUT', `/conversation/${conversationId}/seen/${this.user.id}`))
      .then(timestamp => {
        data.conversation.lastseen = timestamp.lastseen;
      })
      .catch(console.error);
  }

  fetchMessages(id = this.activeChat.conversationId) {
    return this.api.request('GET', `conversation/${id}/message/limited?limit=20&offset=${this.offset}`)
      .then(response => {
        if (!response || !response.length) {
          this.hasPreviousMessages = false;

          return Promise.resolve();
        }

        this.offset += 20;
        this.messages            = this.messages.concat(response);
        this.hasPreviousMessages = !(response.length < 19);

        return Promise.resolve();
      })
      .catch(console.error);
  }

  sendMessage() {
    if (!this.activeChat) {
      return;
    }

    this.api.request('POST', `conversation/${this.activeChat.conversationId}/message/send`, {
      message : this.message,
      senderId: this.user.id
    })
      .then(() => {
        this.message  = '';
        this.messages = [];
        this.offset   = 0;

        return this.fetchMessages();
      })
      .catch(console.error);
  }

  logout() {
    localStorage.removeItem('user');

    this.router.navigate('login');
  }
}
