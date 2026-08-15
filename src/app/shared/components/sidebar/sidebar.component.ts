import { Component, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  path: string;
  icon: string;
  label: string;
  roles: string[];
}
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() collapsed = false;
  // Inyección moderna sin constructor
  private authService = inject(AuthService);
  
  menuItems = [
    { path: '/dashboard', icon: 'bi bi-speedometer2', label: 'Dashboard', roles: ['ADMIN', 'OPERADOR'] },
    { path: '/equipos', icon: 'bi bi-tools', label: 'Equipos', roles: ['ADMIN', 'OPERADOR'] },
    { path: '/epp', icon: 'bi bi-shield-shaded', label: 'Equipos (EPP)', roles: ['ADMIN', 'OPERADOR'] },
    { path: '/bienes', icon: 'bi bi-lamp', label: 'Bienes', roles: ['ADMIN', 'OPERADOR'] },
    { path: '/bomberos', icon: 'bi bi-person-badge', label: 'Bomberos', roles: ['ADMIN', 'OPERADOR'] }, 
    { path: '/vehiculos', icon: 'bi bi-truck', label: 'Vehículos', roles: ['ADMIN', 'OPERADOR'] },
    { path: '/areas', icon: 'bi bi-building', label: 'Áreas', roles: ['ADMIN'] },
    { path: '/ubicaciones', icon: 'bi bi-geo-alt', label: 'Ubicaciones', roles: ['ADMIN'] },
    { path: '/oficinas', icon: 'bi bi-building', label: 'Oficinas', roles: ['ADMIN', 'OPERADOR'] },
    { path: '/casilleros', icon: 'bi bi-lock me-2', label: 'Casilleros', roles: ['ADMIN', 'OPERADOR'] },
    { path: '/asignaciones', icon: 'bi bi-arrow-left-right', label: 'Asignaciones', roles: ['ADMIN', 'OPERADOR'] },
    { path: '/mantenimientos', icon: 'bi bi-calendar-check', label: 'Mantenimientos', roles: ['ADMIN', 'OPERADOR'] },
    { path: '/admin', icon: 'bi bi-shield-lock', label: 'Administración', roles: ['ADMIN'] },
    { path: '/reportes', icon: 'bi bi-file-text', label: 'Reportes', roles: ['ADMIN', 'OPERADOR'] }
  ];

// Reemplazamos el arreglo clásico por una Signal Calculada (Computed)
  filteredMenuItems = computed<MenuItem[]>(() => {
    // Leemos el valor actual de la Signal con paréntesis ()
    const user = this.authService.currentUser(); 
    
    if (user  && user.rol && user.rol.nombre)  {
      const userRole = user.rol.nombre.replace('ROLE_', ''); 
      return this.menuItems.filter(item => item.roles.includes(userRole));
    }
    
    return [];
  });
}