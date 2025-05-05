window.addEventListener("load", () => {
    const map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -1
    });

    const imageWidth = 230;
    const imageHeight = 450;
    const svgHeight = 450;
    const imageBounds = [[0, 0], [imageHeight, imageWidth]];

    L.imageOverlay('RDSC.jpg', imageBounds).addTo(map);
    map.fitBounds(imageBounds);

    const scaleFactorX = imageWidth / 230;
    const scaleFactorY = imageHeight / 450;

    let nodeMap = {};
    let graph = {};
    let userMarker;
    let currentMarkerId = null;
    let pathLayers = [];
    let arrowLayers = [];

    function waitForGraph() {
        if (window.extractedNodes && window.extractedNodes.length > 0 &&
            window.extractedEdges && window.extractedEdges.length > 0) {
            const nodes = window.extractedNodes.map(n => ({
                ...n,
                x: n.x * scaleFactorX,
                y: (svgHeight - n.y) * scaleFactorY
            }));

            nodes.forEach(n => nodeMap[n.id] = n);

            // Build graph
            window.extractedEdges.forEach(edge => {
                const from = nodeMap[edge.from];
                const to = nodeMap[edge.to];
                if (from && to) {
                    if (!graph[from.id]) graph[from.id] = [];
                    if (!graph[to.id]) graph[to.id] = [];
                    const weight = Math.hypot(to.x - from.x, to.y - from.y);
                    graph[from.id].push({ node: to.id, weight });
                    graph[to.id].push({ node: from.id, weight });
                }
            });

            // Render nodes
            nodes.forEach(node => {
                L.circleMarker([node.y, node.x], {
                    radius: 5,
                    color: 'blue',
                    fillColor: 'lightblue',
                    fillOpacity: 0.8
                }).addTo(map).bindPopup(node.id);
            });

            // User marker
            userMarker = L.circleMarker([0, 0], {
                radius: 8,
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.9
            }).addTo(map).bindPopup("You are here");

            // Expose a global function to go to a destination
            window.goTo = function (targetNodeId) {
                if (!currentMarkerId) {
                    console.warn("Current user location not set.");
                    return;
                }
                const result = dijkstra(currentMarkerId, targetNodeId);
                if (result.path) {
                    drawPath(result.path);
                    drawArrows(result.path);
                    console.log(`Shortest path from ${currentMarkerId} to ${targetNodeId}:`, result.path);
                    console.log("Total distance:", result.distance, "m");
                } else {
                    console.warn("No path found.");
                }
            };

            // Set user's current location and update
            window.setUserLocation = function (markerId) {
                const match = nodeMap[markerId];
                if (!match) {
                    console.warn("Marker ID not found:", markerId);
                    return;
                }
                currentMarkerId = markerId;
                userMarker.setLatLng([match.y, match.x]);
                userMarker.openPopup();
                clearPath();
                clearArrows();
            };

            // Pathfinding
            function dijkstra(start, end) {
                const distances = {}, previous = {}, queue = new Set(Object.keys(graph));
                for (const node of queue) {
                    distances[node] = Infinity;
                    previous[node] = null;
                }
                distances[start] = 0;

                while (queue.size > 0) {
                    let currentNode = null;
                    let minDistance = Infinity;
                    for (const node of queue) {
                        if (distances[node] < minDistance) {
                            minDistance = distances[node];
                            currentNode = node;
                        }
                    }

                    if (currentNode === end) break;
                    queue.delete(currentNode);

                    for (const neighbor of graph[currentNode]) {
                        const alt = distances[currentNode] + neighbor.weight;
                        if (alt < distances[neighbor.node]) {
                            distances[neighbor.node] = alt;
                            previous[neighbor.node] = currentNode;
                        }
                    }
                }

                const path = [];
                let curr = end;
                while (curr) {
                    path.unshift(curr);
                    curr = previous[curr];
                }

                return {
                    distance: (distances[end] * 0.04254).toFixed(2),
                    path: distances[end] !== Infinity ? path : null
                };
            }

            function clearPath() {
                pathLayers.forEach(layer => map.removeLayer(layer));
                pathLayers = [];
            }

            function clearArrows() {
                arrowLayers.forEach(mesh => {
                    if (window.mindarScene && mesh) {
                        window.mindarScene.remove(mesh);
                        mesh.geometry.dispose();
                        mesh.material.dispose();
                    }
                });
                arrowLayers = [];
            }

            // Draw Leaflet polyline path
            function drawPath(path) {
                clearPath();
                for (let i = 0; i < path.length - 1; i++) {
                    const from = nodeMap[path[i]];
                    const to = nodeMap[path[i + 1]];
                    const straight = L.polyline([[from.y, from.x], [to.y, to.x]], {
                        color: 'green',
                        weight: 4
                    }).addTo(map);
                    pathLayers.push(straight);
                }
            }

            // Draw 3D arrows in Three.js (MindAR scene)
            function drawArrows(path) {
                clearArrows();
                if (!window.mindarScene) {
                    console.warn("MindAR scene not available.");
                    return;
                }

                path.forEach((nodeId, index) => {
                    if (index < path.length - 1) {
                        const fromNode = nodeMap[nodeId];
                        const toNode = nodeMap[path[index + 1]];

                        const dir = new THREE.Vector3(toNode.x - fromNode.x, toNode.y - fromNode.y, 0);
                        dir.normalize();

                        const geometry = new THREE.ConeGeometry(0.2, 0.5, 8);
                        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
                        const arrow = new THREE.Mesh(geometry, material);

                        arrow.position.set(fromNode.x, fromNode.y, 0.2);
                        arrow.lookAt(new THREE.Vector3(toNode.x, toNode.y, 0));

                        window.mindarScene.add(arrow);
                        arrowLayers.push(arrow);
                    }
                });
            }
        } else {
            setTimeout(waitForGraph, 100);
        }
    }

    waitForGraph();
});
