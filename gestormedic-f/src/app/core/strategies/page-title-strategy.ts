import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable()
export class CustomTitleStrategy extends TitleStrategy {
  private readonly _title = inject(Title);
  private readonly _brandName = 'GestorMedic';

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);

    if (pageTitle !== undefined) {
      this._title.setTitle(`${pageTitle} | ${this._brandName}`);
    } else {
      this._title.setTitle(this._brandName);
    }
  }
}
