import {bindable, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {users} from '../lib/resources';

@inject(Router)
export class Login {
  @bindable username;
  error;

  constructor(router) {
    this.router = router;
  }

  usernameChanged() {
    this.error = false;
  }

  login() {
    if (!this.username) {
      this.error = true;

      return;
    }

    let user = users.filter(user => user.name === this.username);

    if (!user.length) {
      this.error = true;

      return;
    }

    localStorage.setItem('user', JSON.stringify(user[0]));

    return this.router.navigate('chat');
  }
}
