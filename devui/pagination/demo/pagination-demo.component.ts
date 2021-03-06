import {
  Component,
  HostBinding
} from '@angular/core';
import { DevuiSourceData } from '../../shared/devui-codebox';

@Component({
    selector: 'ave-demo-pagination',
    templateUrl: './pagination-demo.component.html'
})
export class PaginationDemoComponent {
  basicSource: Array<DevuiSourceData> = [
    {title: 'HTML', language: 'xml', code:  require('!!raw-loader!./basic/basic.component.html')},
    {title: 'TS', language: 'typescript', code:  require('!!raw-loader!./basic/basic.component.ts')},
    {title: 'CSS', language: 'css', code:  require('!!raw-loader!./basic/basic.component.css')}
  ];

  specialSource: Array<DevuiSourceData> = [
    {title: 'HTML', language: 'xml', code:  require('!!raw-loader!./special/special.component.html')},
    {title: 'TS', language: 'typescript', code:  require('!!raw-loader!./special/special.component.ts')},
    {title: 'CSS', language: 'css', code:  require('!!raw-loader!./special/special.component.css')}
  ];

  constructor() {

  }
}
