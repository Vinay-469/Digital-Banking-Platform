import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

import loanData from '../Shared/config/Emi-config.json';

Chart.register(...registerables);

@Component({
  selector: 'app-emi-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emi-calculator.html',
  styleUrls: ['./emi-calculator.scss']
})
export class EmiCalculator implements OnInit, AfterViewInit {

  @ViewChild('pieChart') pieChartRef!: ElementRef;
  @ViewChild('lineChart') lineChartRef!: ElementRef;

  pieChart: any;
  lineChart: any;

  loanType: string = 'home';

  loanAmount = 0;
  interestRate = 0;
  tenure = 0;

  emi = 0;
  totalInterest = 0;
  totalPayment = 0;

  loanConfig: any = loanData;

  minAmount = 0;
  maxAmount = 0;
  maxTenure = 0;
  minInterest = 0;
  maxInterest = 0;

  // ================= INIT =================
  ngOnInit(): void {
    this.selectLoan('home');
  }

  ngAfterViewInit(): void {
    this.createPieChart();
    this.createLineChart();
  }

  // ================= LOAN CONFIG =================
  selectLoan(type: string) {
    this.loanType = type;

    const config = this.loanConfig[type];

    this.minAmount = config.minAmount;
    this.maxAmount = config.maxAmount;
    this.minInterest = config.minInterest;
    this.maxInterest = config.maxInterest;
    this.maxTenure = config.maxTenure;

    this.loanAmount = this.clamp(config.loanAmount, this.minAmount, this.maxAmount);
    this.interestRate = this.clamp(config.interestRate, this.minInterest, this.maxInterest);
    this.tenure = this.clamp(config.tenure, 1, this.maxTenure);

    this.calculateEMI();
  }

  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  // ================= EMI =================
  calculateEMI() {
    const P = this.loanAmount;
    const r = this.interestRate / 12 / 100;
    const n = this.tenure * 12;

    if (!P || !n) return;

    this.emi = r === 0
      ? Math.round(P / n)
      : Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));

    this.totalPayment = this.emi * n;
    this.totalInterest = this.totalPayment - P;

    this.updateCharts();
  }

  // ================= PIE =================
  createPieChart() {
    this.pieChart = new Chart(this.pieChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Principal', 'Interest'],
        datasets: [{
          data: [this.loanAmount, this.totalInterest],
          backgroundColor: ['#6366f1', '#f59e0b'],
          borderWidth: 0
        }]
      },
      options: {
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // ================= LINE CHART =================
  createLineChart() {
    const { labels, balanceData } = this.getRepaymentSchedule();

    this.lineChart = new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Remaining Balance',
            data: balanceData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.1)',
            fill: true,
            tension: 0.4,

            // 🔥 POINT HIGHLIGHT LOGIC
            pointRadius: (ctx: any) => {
              const index = ctx.dataIndex;
              const last = ctx.dataset.data.length - 1;

              // highlight start, end, and yearly points
              return (index === 0 || index === last || index % 12 === 0) ? 4 : 0;
            },

            pointHoverRadius: 6,
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },

          tooltip: {
            callbacks: {
              label: function (context: any) {
                return `Balance: ₹ ${Math.round(context.raw).toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { maxTicksLimit: 12 },
            grid: { display: false }
          },
          y: {
            grid: { color: '#eee' }
          }
        }
      }
    });
  }

  updateCharts() {
    if (this.pieChart) {
      this.pieChart.data.datasets[0].data = [
        this.loanAmount,
        this.totalInterest
      ];
      this.pieChart.update();
    }

    if (this.lineChart) {
      const { labels, balanceData } = this.getRepaymentSchedule();

      this.lineChart.data.labels = labels;
      this.lineChart.data.datasets[0].data = balanceData;

      this.lineChart.update();
    }
  }

  // ================= REAL REPAYMENT =================
  getRepaymentSchedule() {
    const P = this.loanAmount;
    const r = this.interestRate / 12 / 100;
    const n = this.tenure * 12;

    let balance = P;

    const labels: string[] = [];
    const balanceData: number[] = [];

    for (let i = 1; i <= n; i++) {
      const interest = balance * r;
      const principal = this.emi - interest;

      balance -= principal;

      labels.push(`M${i}`);
      balanceData.push(Math.max(balance, 0));
    }

    return { labels, balanceData };
  }
}