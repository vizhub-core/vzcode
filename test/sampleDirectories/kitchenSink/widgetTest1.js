//Assume relevant modules (potentially from D3) are imported

let aColor = rgb(81, 89, 194);

let b = vec2(181, 110);
/*


*/

var my_transform = d3Transform().translate([60, 60]).rotate(-28);

var group = svg.append("g").attr("transform", my_transfornm);

let a = rgb(236, 24, 24);

let c = false;

let someHTML = (
  <div id="svgcontainer">
    <svg width="300" height="300">
      <g transform="translate(60,60) rotate(-89)">
        <rect x="20" y="20" width="60" height="60" fill="green"></rect>
        <circle cx="0" cy="0" r="30" fill="red" />
      </g>
    </svg>
  </div>
);
