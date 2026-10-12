import { NgOtpInputConfig } from 'ng-otp-input';

export const otp_configuration: NgOtpInputConfig = {
  length: 4,
  allowNumbersOnly: true,
  inputStyles: {
    width: '55px',
    height: '55px',
    'font-size': '22px',
    'border-radius': '10px',
    border: '2px solid #d1d5db',
    margin: '12px',
    'text-align': 'center',
    'font-weight': '600',
    'background-color': '#f9fafb',
    outline: '1px solid #d1d5db'
  }
};