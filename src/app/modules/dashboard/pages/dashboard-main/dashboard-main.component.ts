import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-main.component.html',
  styleUrls: ['./dashboard-main.component.css']
})
export class DashboardMainComponent {
  title = 'Dashboard';
}