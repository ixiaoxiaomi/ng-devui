import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  HostBinding
} from '@angular/core';
import { SourceType, originSource } from '../mock-data';

@Component({
    selector: 'ave-datatable-demo-multiheader',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-table-demo-multiheader.component.html'
})
export class DatatableDemoMultiHeaderComponent implements OnInit {
  @HostBinding('attr.ave-ui') aveUi = true;
  basicDataSource: Array<SourceType> = JSON.parse(JSON.stringify(originSource.slice(0, 6)));

   cellDBClick(e) {
        console.log('cellDB');
        console.log(e);
    }
    cellClick(e) {
        console.log('cell');
        console.log(e);
    }
    rowDBClick(e) {
        console.log('rowDB');
        console.log(e);
    }

    rowClick(e) {
        console.log('row');
        console.log(e);
    }


  ngOnInit() {
  }
}
