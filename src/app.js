import {Redirect} from 'aurelia-router';

export class App {
  configureRouter(config, router) {
    config.title = 'Chat';

    let step = new AuthorizeStep;

    config.addAuthorizeStep(step);

    config.map([
      {
        route   : ['', 'chat'],
        name    : 'chat',
        moduleId: 'page/chat',
        nav     : true,
        title   : 'Chat',
        settings: {
          auth: true,
          user: step.getUser()
        }
      },
      {
        route   : 'login',
        name    : 'login',
        moduleId: 'page/login',
        nav     : false,
        title   : 'Login'
      }
    ]);

    this.router = router;
  }
}

class AuthorizeStep {
  user = JSON.parse(localStorage.getItem('user'));

  run(navigationInstruction, next) {
    if (navigationInstruction.getAllInstructions().some(i => i.config.settings.auth)) {
      let isLoggedIn = !!this.user && typeof this.user !== 'undefined';

      if (!isLoggedIn) {
        return next.cancel(new Redirect('login'));
      }
    }

    return next();
  }

  getUser() {
    return this.user;
  }
}
