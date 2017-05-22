import {inject, bindable} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';
import {users} from '../lib/resources';

@inject(DialogController)
export class Modal {
  @bindable user;

  name;
  users = [];
  availableUsers;


  constructor(controller) {
    this.controller = controller;

    controller.settings.centerHorizontalOnly = true;
  }

  activate(settings) {
    this.title          = settings.title;
    this.user           = settings.user;
    this.availableUsers = users.filter(user => user.id !== this.user.id);

    this.users.push(this.user.id);
  }
}
