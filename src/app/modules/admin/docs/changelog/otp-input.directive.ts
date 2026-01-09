import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appOtpInput]',
  standalone: true
})
export class OtpInputDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: KeyboardEvent) {
    const input = this.el.nativeElement;
    const nextInput = input.nextElementSibling;
    if (input.value.length === 1 && nextInput) {
      nextInput.focus();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const input = this.el.nativeElement;
    const previousInput = input.previousElementSibling;

    if (event.key === 'Backspace' && input.value.length === 0 && previousInput) {
      previousInput.focus();
    }
  }
}
