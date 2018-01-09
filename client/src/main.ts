import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/modules/app/app.module';
import { environment } from './environments/environment';

import * as $ from 'jquery'; window["$"] = $; window["jQuery"] = $;
import "froala-editor/js/froala_editor.pkgd.min.js";

//for some reason these weren't getting imported from the cli config

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
