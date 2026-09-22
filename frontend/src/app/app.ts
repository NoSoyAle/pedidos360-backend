import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly msal = inject(MsalService);

  protected readonly usuario = signal('');

  ngOnInit(): void {
    this.msal.instance.handleRedirectPromise().then(() => {
      const account = this.msal.instance.getActiveAccount() ?? this.msal.instance.getAllAccounts()[0];
      if (account) {
        this.msal.instance.setActiveAccount(account);
        this.usuario.set(account.name ?? account.username);
      }
    });
  }

  login(): void {
    this.msal.loginRedirect();
  }

  logout(): void {
    this.msal.logoutRedirect();
  }
}