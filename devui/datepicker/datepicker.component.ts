import { ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, HostBinding,
        HostListener, Input, OnInit, Output, Renderer2, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DevUIConfig } from '../devui.config';
import { DateConverter } from '../utils/date-converter';
import { DefaultDateConverter } from '../utils/default-date-converter';
import { SelectDateChangeEventArgs, SelectDateChangeReason } from './date-change-event-args.model';

@Component({
  selector: 'ave-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatepickerComponent),
    multi: true
  }]
})
export class DatepickerComponent implements OnInit, ControlValueAccessor {
  static DAY_DURATION = 24 * 60 * 60 * 1000;
  private _maxDate: Date;
  private _minDate: Date;
  private nowMinYear: number;
  private nowMaxYear: number;
  private _dateFormat: string;
  @Input() showTime: boolean;
  @Input() cssClass: string;
  @Input() dateConverter: DateConverter;
  @Input() locale: string;
  @Output() selectedDateChange = new EventEmitter<SelectDateChangeEventArgs>();
  @Input() disabled = false;
  @Input() yearNumber = 12;
  @Input() customViewTemplate: TemplateRef<any>;
  @HostBinding('attr.ave-ui') aveUi = true;
  _dateConfig: any;
  currentYear: number;
  currentMonth: number;
  currentHour: number;
  currentMinute: number;
  currentSecond: number;
  hourOptions: string[];
  minuteOptions: string[];
  displayWeeks: any[];
  yearOptions: number[];
  openChooseYearAndMonth: boolean;
  selectedDate: Date;
  hoverYear: number;
  hoverMonth: number;
  availableMonths: number[];

  private onChange = (_: any) => null;
  private onTouched = () => null;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private devuiConfig: DevUIConfig,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this._dateConfig = this.devuiConfig['datePickerCN'];
    this.dateConverter = this.devuiConfig['datePickerCN'].dateConverter || new DefaultDateConverter();
    this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'inline-block');
    this.selectedDate = null;
  }

  ngOnInit() {
    this.locale = this.dateConfig.locale;
    this.showTime = this.showTime || this.dateConfig.timePicker;
    this._minDate = this.minDate ? new Date(this.minDate) : new Date(this.dateConfig.min, 0, 1, 0, 0, 0);
    this._maxDate = this.maxDate ? new Date(this.maxDate) : new Date(this.dateConfig.max, 11, 31, 23, 59, 59);

    this.hourOptions = new Array(24).fill(0).map((value, index) => this.fillLeft(index));
    this.minuteOptions = new Array(60).fill(0).map((value, index) => this.fillLeft(index));
    this.nowMinYear = (new Date()).getFullYear() - Math.floor(this.yearNumber / 2) < this.minDate.getFullYear() ?
                      this.minDate.getFullYear() : (new Date()).getFullYear() - Math.floor(this.yearNumber / 2);
    this.nowMaxYear = this.nowMinYear + this.yearNumber > this.maxDate.getFullYear() ?
                      this.maxDate.getFullYear() : this.nowMinYear + this.yearNumber;
    this.onSelectDateChanged();
    this.onDisplayWeeksChange();
    this.onYearRangeChange();
    if (!this.selectedDate) {
      this.chooseToday();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick($event) {
    if (!this.elementRef.nativeElement.contains($event.target)) {
      this.openChooseYearAndMonth = false;
      this.resetYearOptions();
    }
  }

  @HostListener('click', ['$event'])
  onClick($event) {
    $event.stopPropagation();
  }

  @Input() set dateConfig(dateConfig: any) {
    this._dateConfig = this.checkDateConfig(dateConfig) ? dateConfig : this._dateConfig;
  }

  get dateConfig() {
    return this._dateConfig;
  }

  checkDateConfig(dateConfig: any) {
    if (!dateConfig.locale || typeof(dateConfig.timePicker) !== 'boolean' || !dateConfig.weeks
      || !dateConfig.months || !dateConfig.max || !dateConfig.min
      || !dateConfig.format || !dateConfig.current) {
      return false;
    }
    return true;
  }

  @Input() set minDate(date: Date | any) {
    const parseDate = this.dateConverter.parse(date, this.getDateFormat(), this.locale);
    if (parseDate) {
      this._minDate = parseDate;
      this.onYearRangeChange();
    }
  }

  @Input() set maxDate(date: Date | any) {
    const parseDate = this.dateConverter.parse(date, this.getDateFormat(), this.locale);
    if (parseDate) {
      this._maxDate = parseDate;
      this.onYearRangeChange();
    }
  }

  get maxDate() {
    return this._maxDate;
  }

  get minDate() {
    return this._minDate;
  }

  @Input() set dateFormat(dateFormat: string) {
    if (this._dateFormat !== dateFormat) {
      this._dateFormat = dateFormat;
    }
  }

  get dateFormat() {
    return this._dateFormat;
  }

  private getDateFormat() {
    if (this.dateFormat) {
      return this.dateFormat;
    }
    return this.showTime ? this.dateConfig.format.time : this.dateConfig.format.date;
  }

  private resetYearOptions() {
    const baseYear = this.selectedDate ? this.selectedDate.getFullYear() : (new Date()).getFullYear();
    this.currentYear = baseYear;
    this.nowMinYear = baseYear - Math.floor(this.yearNumber / 2) < this.minDate.getFullYear() ?
                    this.minDate.getFullYear() : baseYear - Math.floor(this.yearNumber / 2);
    this.nowMaxYear = this.nowMinYear + this.yearNumber > this.maxDate.getFullYear() ?
                    this.maxDate.getFullYear() : this.nowMinYear + this.yearNumber;
    this.onYearRangeChange();
  }

  onYearRangeChange() {
    if (!this.nowMinYear || !this.nowMaxYear) {
      return;
    }
    const yearNumber = this.yearNumber > this.nowMaxYear - this.nowMinYear + 1 ? this.nowMaxYear - this.nowMinYear + 1 : this.yearNumber;
    this.yearOptions = new Array(yearNumber).fill(0).map((value, index) => {
      return this.nowMinYear + index;
    });
  }

  writeValue(obj: any): void {
    if (!obj) {
      return;
    }
    this.selectedDate = obj ?
      this.dateConverter.parse(obj, this.getDateFormat(), this.locale) : null;
    this.onSelectDateChanged();
    this.onDisplayWeeksChange();
    this.availableMonths = this.onDisplayMonthsChange();
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  hasPreMonth() {
    return this.currentMonth > 0 || this.currentYear > this.minDate.getFullYear();
  }

  onPreMonth() {
    if (!this.hasPreMonth()) {
      return;
    }

    if (this.currentMonth > 0) {
      this.currentMonth -= 1;
    } else {
      this.currentMonth = 11;
      this.currentYear -= 1;
    }
    this.onDisplayWeeksChange();
  }

  hasNextMonth() {
    return this.currentMonth < 11 || this.currentYear < this.maxDate.getFullYear();
  }

  onNextMonth() {
    if (!this.hasNextMonth()) {
      return;
    }

    if (this.currentMonth < 11) {
      this.currentMonth += 1;
    } else {
      this.currentMonth = 0;
      this.currentYear += 1;
    }
    this.onDisplayWeeksChange();
  }

  hasPreYearOption() {
    return this.nowMinYear > this.minDate.getFullYear();
  }

  onPreYearOption() {
    if (!this.hasPreYearOption()) {
      return;
    }

    if (this.nowMinYear - this.yearNumber >= this.minDate.getFullYear()) {
      this.nowMaxYear = this.nowMinYear - 1;
      this.nowMinYear = this.nowMinYear - this.yearNumber;
    } else {
      this.nowMaxYear = this.nowMinYear - 1;
      this.nowMinYear = this.minDate.getFullYear();
    }
    this.onYearRangeChange();
  }

  hasNextYearOption() {
    return this.nowMaxYear < this.maxDate.getFullYear();
  }

  onNextYearOption() {
    if (!this.hasNextYearOption()) {
      return;
    }

    if (this.nowMaxYear + this.yearNumber <= this.maxDate.getFullYear()) {
      this.nowMinYear = this.nowMaxYear + 1;
      this.nowMaxYear = this.nowMaxYear + this.yearNumber;
    } else {
      this.nowMinYear = this.nowMaxYear + 1;
      this.nowMaxYear = this.maxDate.getFullYear();
    }
    this.onYearRangeChange();
  }

  onSelectYear(year, $event?: Event) {
    if ($event) {
      $event.stopPropagation();
    }
    this.currentYear = year;
    this.onDisplayWeeksChange();
    this.availableMonths = this.onDisplayMonthsChange();
  }

  private onSelectDateChanged() {
    let date = this.selectedDate || new Date();
    if (date.getTime() < this.minDate.getTime()) {
      date = this.minDate;
    }
    if (date.getTime() > this.maxDate.getTime()) {
      date = this.maxDate;
    }
    this.currentYear = date.getFullYear();
    this.currentMonth = date.getMonth();
    this.currentHour = this.showTime ? date.getHours() : 0;
    this.currentMinute = this.showTime ? date.getMinutes() : 0;
    this.currentSecond = this.showTime ? date.getSeconds() : 0;
  }

  public onDisplayWeeksChange() {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const weekOfDay = firstDayOfMonth.getDay();
    const startDate = new Date(firstDayOfMonth.getTime() - weekOfDay * DatepickerComponent.DAY_DURATION);
    const displayWeeks = [];
    for (let i = 0; i < 6; i++) {
      const startWeekDate = startDate.getTime() + i * 7 * DatepickerComponent.DAY_DURATION;
      const weekDays = new Array(7).fill(0).map((value, index) => {
        const currentDate = new Date(startWeekDate + index * DatepickerComponent.DAY_DURATION);
        return {
          day: this.fillLeft(currentDate.getDate()),
          date: currentDate,
          inMonth: currentDate.getMonth().toString() === this.currentMonth.toString()
        };
      });
      displayWeeks.push(weekDays);
    }
    this.displayWeeks = displayWeeks;
  }

  public onDisplayMonthsChange() {
    const all = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    if (this.currentYear > this.minDate.getFullYear() && this.currentYear < this.maxDate.getFullYear()) {
      return all;
    }

    if (this.currentYear < this.minDate.getFullYear() || this.currentYear > this.maxDate.getFullYear()) {
      return [];
    }

    const returnValue = [];
    if (this.currentYear === this.minDate.getFullYear()) {
      for (const month of all) {
        if (month >= this.minDate.getMonth()) {
          returnValue.push(month);
        }
      }
      return returnValue;
    }

    if (this.currentYear === this.maxDate.getFullYear()) {
      for (const month of all) {
        if (month <= this.maxDate.getMonth()) {
          returnValue.push(month);
        }
      }
      return returnValue;
    }
  }

  private fillLeft(num: number) {
    return num < 10 ? `0${num}` : `${num}`;
  }

  isDisabledDay(date) {
    const minDate = new Date(this.minDate.getFullYear(), this.minDate.getMonth(), this.minDate.getDate());
    const maxDate = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), this.maxDate.getDate(), 23, 59, 59);
    return this.disabled || (date.getTime() < minDate.getTime() ||
      date.getTime() > maxDate.getTime());
  }

  isSelectDay(date) {
    if (!this.selectedDate || !date) {
      return false;
    }
    return (
        (
          date.getFullYear() === this.selectedDate.getFullYear() &&
          date.getMonth() === this.selectedDate.getMonth() &&
          date.getDate() === this.selectedDate.getDate()
        )
    );
  }

  onSelectDate($event, date) {
    if ($event.stopPropagation) {
      $event.stopPropagation();
    }
    if (this.isDisabledDay(date)) {
      return;
    }
    this.selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
      this.currentHour, this.currentMinute, this.currentSecond);
    this.onTouched();
    this.writeValue(this.selectedDate);
    this.onChange(this.selectedDate);
    this.selectedDateChange.emit({
      reason: SelectDateChangeReason.date,
      selectedDate: this.selectedDate
    });
    if (this.currentMonth !== this.selectedDate.getMonth() ||
      this.currentYear !== this.selectedDate.getFullYear()
    ) {
      this.currentYear = this.selectedDate.getFullYear();
      this.currentMonth = this.selectedDate.getMonth();
      this.onDisplayWeeksChange();
    }
  }

  onTimeChange() {
    const date = this.selectedDate || new Date();
    this.selectedDate = new Date(date.getFullYear(),
      date.getMonth(), date.getDate(), this.currentHour, this.currentMinute, this.currentSecond);
    this.onTouched();
    this.writeValue(this.selectedDate);
    this.onChange(this.selectedDate);
    this.selectedDateChange.emit({
      reason: SelectDateChangeReason.time,
      selectedDate: this.selectedDate
    });
  }

  timeUp (type) {
    switch (type) {
      case 'h': {
        this.currentHour < 23 ? this.currentHour += 1 : this.currentHour = 0;
        break;
      }
      case 'm': {
        this.currentMinute < 59 ? this.currentMinute += 1 : this.currentMinute = 0;
        break;
      }
      case 's': {
        this.currentSecond < 59 ? this.currentSecond += 1 : this.currentSecond = 0;
        break;
      }
    }
    this.onTimeChange();
  }

  timeDown (type) {
    switch (type) {
      case 'h': {
        this.currentHour > 0 ? this.currentHour -= 1 : this.currentHour = 23;
        break;
      }
      case 'm': {
         this.currentMinute > 0 ? this.currentMinute -= 1 : this.currentMinute = 59;
        break;
      }
      case 's': {
        this.currentSecond > 0 ? this.currentSecond -= 1 : this.currentSecond = 59;
        break;
      }
    }
    this.onTimeChange();
  }

  clearAll() {
    this.writeValue(null);
    this.onChange(null);
  }

  toggle($event: Event) {
    $event.stopPropagation();
    this.openChooseYearAndMonth = !this.openChooseYearAndMonth;
  }

  isTodayDisable() {
   return this.isDisabledDay(new Date());
  }

  chooseToday() {
    const today = new Date();
    if (this.isDisabledDay(today)) {
      return;
    }
    this.selectedDate = today;
    this.onSelectDateChanged();
    this.onSelectDate({}, today);
  }

  onSelectMonth($index) {
    this.currentMonth = $index;
    this.onDisplayWeeksChange();
  }

  changeHoverYear(item: number) {
    this.hoverYear = item;
  }

  changeHoverMonth(item: number) {
    this.hoverMonth = item;
  }

  chooseDate = (date: string, event = {}) => {
    const parseDate = this.dateConverter.parse(date, this.getDateFormat(), this.locale);
    this.selectedDate = parseDate || new Date();
    this.onSelectDateChanged();
    this.onSelectDate(event, parseDate);
  }
}
