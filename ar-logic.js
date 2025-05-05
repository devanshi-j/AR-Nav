// // Wait for the graph data to be ready
// function waitForGraph() {
//     if (window.extractedNodes && window.extractedNodes.length > 0 && window.extractedEdges && window.extractedEdges.length > 0) {
//         const scaleFactorX = 230 / 230; // Assuming scale factor is 1:1
//         const scaleFactorY = 450 / 450; // Assuming scale factor is 1:1
//         let nodeMap = {};
//         let graph = {};

//         // Convert node data to AR coordinates (already in window.extractedNodes)
//         window.extractedNodes.forEach(n => {
//             nodeMap[n.id] = {
//                 ...n,
//                 x: n.x * scaleFactorX,
//                 y: (450 - n.y) * scaleFactorY // Adjust y to fit AR coordinate system
//             };
//         });

//         // Build the graph with edges and weights (distances)
//         window.extractedEdges.forEach(edge => {
//             const from = nodeMap[edge.from];
//             const to = nodeMap[edge.to];
//             if (from && to) {
//                 if (!graph[from.id]) graph[from.id] = [];
//                 if (!graph[to.id]) graph[to.id] = [];
//                 const weight = Math.hypot(to.x - from.x, to.y - from.y);
//                 graph[from.id].push({ node: to.id, weight });
//                 graph[to.id].push({ node: from.id, weight });
//             }
//         });

//         // Expose global function to go to destination node and draw path
//         window.goTo = function (targetNodeId) {
//             if (!window.currentMarkerId) {
//                 console.warn("Current user location not set.");
//                 return;
//             }
//             const result = dijkstra(window.currentMarkerId, targetNodeId);
//             if (result.path) {
//                 drawPath(result.path);
//                 drawArrows(result.path);
//                 console.log(`Shortest path from ${window.currentMarkerId} to ${targetNodeId}:`, result.path);
//                 console.log("Total distance:", result.distance, "m");
//             } else {
//                 console.warn("No path found.");
//             }
//         };

//         // Pathfinding algorithm (Dijkstra)
//         function dijkstra(start, end) {
//             const distances = {}, previous = {}, queue = new Set(Object.keys(graph));
//             for (const node of queue) {
//                 distances[node] = Infinity;
//                 previous[node] = null;
//             }
//             distances[start] = 0;

//             while (queue.size > 0) {
//                 let currentNode = null;
//                 let minDistance = Infinity;
//                 for (const node of queue) {
//                     if (distances[node] < minDistance) {
//                         minDistance = distances[node];
//                         currentNode = node;
//                     }
//                 }

//                 if (currentNode === end) break;
//                 queue.delete(currentNode);

//                 for (const neighbor of graph[currentNode]) {
//                     const alt = distances[currentNode] + neighbor.weight;
//                     if (alt < distances[neighbor.node]) {
//                         distances[neighbor.node] = alt;
//                         previous[neighbor.node] = currentNode;
//                     }
//                 }
//             }

//             const path = [];
//             let curr = end;
//             while (curr) {
//                 path.unshift(curr);
//                 curr = previous[curr];
//             }

//             return {
//                 distance: (distances[end] * 0.04254).toFixed(2), // Adjust the conversion factor as needed
//                 path: distances[end] !== Infinity ? path : null
//             };
//         }

//         // Helper function to draw the path on the AR scene
//         function drawPath(path) {
//             clearPath();
//             path.forEach((nodeId, index) => {
//                 if (index < path.length - 1) {
//                     const fromNode = nodeMap[nodeId];
//                     const toNode = nodeMap[path[index + 1]];
//                     drawLine(fromNode, toNode);
//                 }
//             });
//         }

//         // Helper function to draw a line between two nodes in AR
//         function drawLine(fromNode, toNode) {
//             const line = document.createElement('a-entity');
//             const position = `position: ${fromNode.x} ${fromNode.y} 0`;
//             line.setAttribute('geometry', 'primitive: line; start: 0 0 0; end: 1 1 0');
//             line.setAttribute('material', 'color: green');
//             line.setAttribute('position', position);
//             document.querySelector('a-scene').appendChild(line);
//         }

//         // Helper function to draw AR arrows along the path
//         function drawArrows(path) {
//             clearArrows();
//             path.forEach((nodeId, index) => {
//                 if (index < path.length - 1) {
//                     const fromNode = nodeMap[nodeId];
//                     const toNode = nodeMap[path[index + 1]];
//                     drawArrow(fromNode, toNode);
//                 }
//             });
//         }

//         // Function to draw an arrow in AR from one node to the next
//         function drawArrow(fromNode, toNode) {
//             const arrow = document.createElement('a-entity');
//             const angle = calculateRotation(fromNode, toNode); // Calculate rotation between nodes
//             const position = `position: ${fromNode.x} ${fromNode.y} 0; rotation: 0 ${angle} 0`;

//             arrow.setAttribute('geometry', 'primitive: cone; height: 0.5; radiusBottom: 0.1');
//             arrow.setAttribute('material', 'color: yellow');
//             arrow.setAttribute('position', position);

//             document.querySelector('a-scene').appendChild(arrow);
//         }

//         // Helper function to calculate rotation between two points
//         function calculateRotation(fromNode, toNode) {
//             const deltaX = toNode.x - fromNode.x;
//             const deltaY = toNode.y - fromNode.y;
//             const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI); // In degrees
//             return angle;
//         }

//         // Function to clear existing path lines
//         function clearPath() {
//             const lines = document.querySelectorAll('a-entity[geometry="primitive: line"]');
//             lines.forEach(line => line.parentNode.removeChild(line));
//         }

//         // Function to clear existing arrows
//         function clearArrows() {
//             const arrows = document.querySelectorAll('a-entity[geometry="primitive: cone"]');
//             arrows.forEach(arrow => arrow.parentNode.removeChild(arrow));
//         }
//     } else {
//         setTimeout(waitForGraph, 100); // Retry if the graph is not yet available
//     }
// }

// // Start the process once the window is loaded
// window.addEventListener("load", waitForGraph);
