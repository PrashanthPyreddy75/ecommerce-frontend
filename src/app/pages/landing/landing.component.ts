import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy {
  countdownText = '';
  private offerEndTime: Date = new Date(new Date().getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
  private timer: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  startCountdown() {
    this.timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = this.offerEndTime.getTime() - now;

      if (distance <= 0) {
        this.countdownText = 'Offer has expired!';
        clearInterval(this.timer);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.countdownText = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    }, 1000);
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
