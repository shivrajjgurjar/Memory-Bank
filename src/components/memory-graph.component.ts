
import { Component, ElementRef, ViewChild, effect, input, output, inject } from '@angular/core';
import * as d3 from 'd3';
import { Memory } from '../types';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-memory-graph',
  standalone: true,
  template: `
    <div class="relative w-full h-[500px] bg-neutral-50 dark:bg-[#151515] rounded-sm overflow-hidden border border-neutral-100 dark:border-neutral-800 animate-fade-in">
      <div #graphContainer class="w-full h-full"></div>
      
      <div class="absolute bottom-4 left-4 text-[10px] font-sans text-neutral-400 uppercase tracking-widest pointer-events-none">
        Constellation View
      </div>
      
      <button (click)="close.emit()" class="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  `
})
export class MemoryGraphComponent {
  store = inject(StoreService);
  rootMemory = input.required<Memory>();
  close = output<void>();
  
  @ViewChild('graphContainer') container!: ElementRef;

  constructor() {
    effect(() => {
      const root = this.rootMemory();
      // Wait for view init
      setTimeout(() => {
        if (this.container && root) {
          this.renderGraph(root);
        }
      }, 50);
    });
  }

  private renderGraph(root: Memory) {
    const element = this.container.nativeElement;
    element.innerHTML = ''; // Clear previous

    const width = element.clientWidth;
    const height = element.clientHeight;
    const isDark = document.documentElement.classList.contains('dark');
    
    // Colors
    const nodeColor = isDark ? '#ffffff' : '#171717';
    const linkColor = isDark ? '#404040' : '#d4d4d4';
    const textColor = isDark ? '#a3a3a3' : '#525252';

    // Data Preparation
    // Get 1st degree connections
    const linkedIds = root.linkedMemoryIds || [];
    const linkedMemories = this.store.memories().filter(m => linkedIds.includes(m.id));

    const nodes = [
      { id: root.id, label: root.title, group: 'root', r: 8 },
      ...linkedMemories.map(m => ({ id: m.id, label: m.title, group: 'leaf', r: 5 }))
    ];

    const links = linkedMemories.map(m => ({ source: root.id, target: m.id }));

    // Simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // SVG
    const svg = d3.select(element).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Lines
    const link = svg.append('g')
      .attr('stroke', linkColor)
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1);

    // Nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.r)
      .attr('fill', d => d.group === 'root' ? nodeColor : (isDark ? '#555' : '#ccc'))
      .attr('stroke', isDark ? '#151515' : '#fff')
      .attr('stroke-width', 2)
      .call(drag(simulation) as any)
      .on('click', (event, d: any) => {
         if (d.id !== root.id) {
           this.store.setActiveMemory(d.id);
         }
      })
      .style('cursor', 'pointer');

    // Labels
    const text = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.label.length > 20 ? d.label.substring(0, 18) + '...' : d.label)
      .attr('font-family', 'sans-serif')
      .attr('font-size', '10px')
      .attr('fill', textColor)
      .attr('dx', 12)
      .attr('dy', 4)
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .transition().duration(1000).style('opacity', 1);

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
        
      text
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    // Drag behavior
    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }
}
