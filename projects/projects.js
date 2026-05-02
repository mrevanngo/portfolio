import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

let query = '';

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let selectedIndex = -1;

function renderPieChart(projectsGiven) {
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));

  let svg = d3.select('svg');
  let legend = d3.select('.legend');

  // Clear previous pie slices and legend items
  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  // Draw pie slices
  newArcs.forEach((arc, idx) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;

        svg
          .selectAll('path')
          .attr('class', (_, i) => (selectedIndex === i ? 'selected' : ''));

        legend
          .selectAll('li')
          .attr('class', (_, i) =>
            selectedIndex === i ? 'legend-item selected' : 'legend-item',
          );

        if (selectedIndex === -1) {
          renderProjects(projects, projectsContainer, 'h2');
          projectsTitle.textContent = `${projects.length} Projects`;
        } else {
          let selectedYear = newData[selectedIndex].label;
          let filteredByYear = projects.filter((p) => p.year === selectedYear);
          renderProjects(filteredByYear, projectsContainer, 'h2');
          projectsTitle.textContent = `${filteredByYear.length} Projects`;
        }
      });
  });

  // Draw legend
  newData.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// Initial render
renderProjects(projects, projectsContainer, 'h2');
projectsTitle.textContent = `${projects.length} Projects`;
renderPieChart(projects);

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = event.target.value;

  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');
  projectsTitle.textContent = `${filteredProjects.length} Projects`;
  renderPieChart(filteredProjects);
});
