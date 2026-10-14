import { Component, Input, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  path: string;
  icon: string;
  label: string;
  roles: string[];
}

interface MenuCategory {
  title: string;
  icon?: string; 
  items: MenuItem[];
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
  private authService = inject(AuthService);
  
  // SIGNAL para controlar el estado abierto/cerrado de cada categoría
  // Por defecto, iniciamos con "Principal" y "Gestión de Activos" abiertos
  openCategories = signal<{ [key: string]: boolean }>({
    'Principal': true,
    'Gestión de Activos': true
  });

  menuCategories: MenuCategory[] = [
    {
      title: 'Principal',
      items: [
        { path: '/dashboard', icon: 'bi bi-speedometer2', label: 'Dashboard', roles: ['ADMIN', 'OPERADOR'] }
      ]
    },
    {
      title: 'Gestión de Activos',
      items: [
        { path: '/equipos', icon: 'bi bi-tools', label: 'Equipos', roles: ['ADMIN', 'OPERADOR'] },
        { path: '/epp', icon: 'bi bi-shield-shaded', label: 'Equipos (EPP)', roles: ['ADMIN', 'OPERADOR'] },
        { path: '/bienes', icon: 'bi bi-lamp', label: 'Bienes', roles: ['ADMIN', 'OPERADOR'] }
      ]
    },
    {
      title: 'Efectivos / Recursos',
      items: [
        { path: '/bomberos', icon: 'bi bi-person-badge', label: 'Bomberos', roles: ['ADMIN', 'OPERADOR'] }, 
        { path: '/vehiculos', icon: 'bi bi-truck', label: 'Vehículos', roles: ['ADMIN', 'OPERADOR'] }
      ]
    },
    {
      title: 'Ubicaciones Físicas',
      items: [
        { path: '/areas', icon: 'bi bi-building', label: 'Áreas', roles: ['ADMIN'] },
        { path: '/ubicaciones', icon: 'bi bi-geo-alt', label: 'Ubicaciones', roles: ['ADMIN'] },
        { path: '/oficinas', icon: 'bi bi-building', label: 'Oficinas', roles: ['ADMIN', 'OPERADOR'] },
        { path: '/casilleros', icon: 'bi bi-lock', label: 'Casilleros', roles: ['ADMIN', 'OPERADOR'] }
      ]
    },
    {
      title: 'Operaciones',
      items: [
        { path: '/asignaciones', icon: 'bi bi-arrow-left-right', label: 'Asignaciones', roles: ['ADMIN', 'OPERADOR'] },
        { path: '/mantenimientos', icon: 'bi bi-calendar-check', label: 'Mantenimientos', roles: ['ADMIN', 'OPERADOR'] }
      ]
    },
    {
      title: 'Sistema',
      items: [
        { path: '/admin', icon: 'bi bi-shield-lock', label: 'Administración', roles: ['ADMIN'] },
        { path: '/reportes', icon: 'bi bi-file-text', label: 'Reportes', roles: ['ADMIN', 'OPERADOR'] }
      ]
    }
  ];

  filteredMenuCategories = computed<MenuCategory[]>(() => {
    const user = this.authService.currentUser(); 
    if (user && user.rol && user.rol.nombre) {
      const userRole = user.rol.nombre.replace('ROLE_', ''); 
      return this.menuCategories
        .map(category => ({
          ...category,
          items: category.items.filter(item => item.roles.includes(userRole))
        }))
        .filter(category => category.items.length > 0);
    }
    return [];
  });

  // Método para alternar el estado del colapso
  toggleCategory(title: string): void {
    // Si el menú general está colapsado, no permitimos el acordeón para evitar problemas visuales
    if (this.collapsed) return;

    this.openCategories.update(current => ({
      ...current,
      [title]: !current[title]
    }));
  }

  // Helper para saber si una categoría está expandida en el HTML
  isCategoryOpen(title: string): boolean {
    // Si el sidebar está cerrado (collapsed), forzamos a que muestre todo o maneje tooltips
    if (this.collapsed) return true;
    return !!this.openCategories()[title];
  }
}
