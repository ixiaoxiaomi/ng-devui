import { Component, Input, ContentChild, ChangeDetectionStrategy } from '@angular/core';
import { TabContentDirective } from './tab-content.directive';
import { TabTitleDirective } from './tab-title.directive';

@Component({
  selector: 'ave-tab',
  template: '',
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabComponent {
  @Input() tabId?: string;
  @Input() id: number |string;
  @Input() title: string;
  @Input() disabled = false;
  @ContentChild(TabContentDirective) contentTpl: TabContentDirective;
  @ContentChild(TabTitleDirective) titleTpl: TabTitleDirective;
}
