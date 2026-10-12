import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Account, Transaction, UserService } from '../Shared/Custom-Services/user-service';
import { AuthService } from '../Shared/Custom-Services/auth-state';

@Component({
  selector: 'app-expense-tracker',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './expense-tracker.html',
  styleUrl: './expense-tracker.scss',
})
export class ExpenseTracker implements OnInit {

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  accounts: Account[] = [];
  selectedAccountId: number | undefined;

  pieChart: any;
  barChart: any;

  // ✅ DEFAULT CURRENT MONTH
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();

  totalBalance = 0;

  constructor(
    private service: UserService,
    private authState: AuthService
  ) { }

  ngOnInit() {
    this.loadAccounts(this.authState.userId());
  }

  loadAccounts(userId: number | null) {
    this.service.getActiveAccounts(userId).subscribe(res => {
      this.accounts = res;

      if (this.accounts.length > 0) {
        this.selectedAccountId = this.accounts[0].accountId;
        this.loadTransactions(userId);
      }
    });
  }

  loadTransactions(userId: number | null) {
    this.service.getTransactions(userId).subscribe(res => {
      this.transactions = res;

      // ✅ APPLY FILTER IMMEDIATELY
      this.applyMonthFilter();
    });
  }

  applyMonthFilter() {

    // ✅ FILTER BY MONTH
    this.filteredTransactions = this.transactions.filter(t => {
      const d = new Date(t.transactionDate);

      return (
        d.getMonth() === this.selectedMonth &&
        d.getFullYear() === this.selectedYear
      );
    });

    // ✅ UNIQUE ACCOUNT BALANCE (NO DUPLICATE)
    const seen = new Set<number>();

    this.totalBalance = this.transactions.reduce((sum, t) => {
      const id = t.account?.accountId;

      if (id && !seen.has(id)) {
        seen.add(id);
        return sum + (t.account?.balance || 0);
      }
      return sum;
    }, 0);

    // ✅ CHARTS UPDATE
     setTimeout(() => {
    this.generatePieChart();

    if (this.barChart) this.barChart.destroy();
    this.generateMonthlyBarChart();
  }, 0);
  }

  // ✅ MONTH NAVIGATION
  goToPreviousMonth() {
    this.selectedMonth--;

    if (this.selectedMonth < 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    }

    this.applyMonthFilter();
  }

  goToNextMonth() {
    this.selectedMonth++;

    if (this.selectedMonth > 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    }

    this.applyMonthFilter();
  }

  getMonthName(): string {
    return new Date(this.selectedYear, this.selectedMonth)
      .toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  selectAccount(accountId: number | undefined) {
    this.selectedAccountId = accountId;

    if (this.barChart) this.barChart.destroy();
    this.generateMonthlyBarChart();
  }

  // ✅ PIE CHART
  generatePieChart() {
    let income = 0;
    let expense = 0;

    this.filteredTransactions.forEach(t => {
      const amt = t.amount ?? 0;
      t.transactionType ? income += amt : expense += amt;
    });

    if (this.pieChart) this.pieChart.destroy();

    this.pieChart = new Chart('pieChart', {
      type: 'doughnut',
      data: {
        labels: ['Income', 'Expense'],
        datasets: [{
          data: [income, expense],
          backgroundColor: ['#38bdf8', '#ef4444']
        }]
      },
      options: {
        cutout: '65%',
        plugins: { legend: { position: 'right' } }
      }
    });
  }

  //  BAR CHART
  generateMonthlyBarChart() {

    const filtered = this.transactions.filter(t =>
      t.accountId === this.selectedAccountId
    );

    const monthly: any = {};

    filtered.forEach(t => {
      const month = new Date(t.transactionDate)
        .toLocaleString('default', { month: 'short' });

      if (!monthly[month]) {
        monthly[month] = { income: 0, expense: 0 };
      }

      const amt = t.amount ?? 0;

      t.transactionType
        ? monthly[month].income += amt
        : monthly[month].expense += amt;
    });

    const labels = Object.keys(monthly);

    if (this.barChart) this.barChart.destroy();

    this.barChart = new Chart('barChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: labels.map(m => monthly[m].income),
            backgroundColor: '#38bdf8',
            borderRadius: 6,
            barThickness: 40
          },
          {
            label: 'Expense',
            data: labels.map(m => monthly[m].expense),
            backgroundColor: '#ef4444',
            borderRadius: 6,
            barThickness: 40
          }
        ]
      }
    });
  }

  // ✅ TOTALS
  get totalIncome() {
    return this.filteredTransactions
      .filter(t => t.transactionType)
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);
  }

  get totalExpense() {
    return this.filteredTransactions
      .filter(t => !t.transactionType)
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);
  }
}