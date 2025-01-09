import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pokemon-stats',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './pokemon-stats.component.html',
  styleUrl: './pokemon-stats.component.css',
  animations: [
    trigger('barAnimation', [
      state('in', style({ width: '*' })),
      transition(':enter', [
        style({ width: '0%' }),
        animate('1000ms ease-out')
      ])
    ])
  ]
})
export class PokemonStatsComponent {
  @Input() stats: any[] = [];
  maxStat: number = 255; // Máximo valor posible en stats de Pokémon

  ngOnInit() {
    // Puedes ajustar el maxStat según tus necesidades
  }

  formatStatName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getStatColor(statName: string): string {
    const colors: { [key: string]: string } = {
      'hp': '#FF0000',
      'attack': '#F08030',
      'defense': '#F8D030',
      'special-attack': '#6890F0',
      'special-defense': '#78C850',
      'speed': '#F85888'
    };
    return colors[statName] || '#666666';
  }
}
