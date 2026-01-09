import { Directive, HostListener, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appCardNumberFormat]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CardNumberFormatDirective),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CardNumberFormatDirective),
      multi: true
    }
  ],
  standalone: true,
})
export class CardNumberFormatDirective implements ControlValueAccessor, Validator {
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
    const formattedValue = digitsOnly.replace(/(.{4})/g, '$1 ').trim();
    this.el.nativeElement.value = formattedValue;
    this.onChange(digitsOnly);
    this.onTouched();
  }

  writeValue(value: string): void {
    const digitsOnly = value ? value.replace(/\D/g, '').slice(0, 16) : '';
    const formattedValue = digitsOnly.replace(/(.{4})/g, '$1 ').trim();
    this.el.nativeElement.value = formattedValue;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  validate(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value ? control.value.replace(/\D/g, '') : '';
    if (!value) {
      return { 'required': true };
    }
    if (value.length !== 16 || !this.isValidCardNumber(value)) {
      return { 'pattern': true };
    }
    return null;
  }

  private isValidCardNumber(cardNumber: string): boolean {
    let sum = 0;
    let shouldDouble = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return (sum % 10 === 0);
  }
}
