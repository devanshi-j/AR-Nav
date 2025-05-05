// markerDetection.js

// Set up initial map and marker data
const markerToNodeMap = {
    "marker-A": "Entrance",
    "marker-B": "Room1",
    "marker-C": "Room2"
};

// Function to set up marker event listeners
function setupMarkerEvents() {
    // Assuming your markers have specific ids, e.g., "marker-A", "marker-B"
    document.querySelectorAll('a-marker').forEach(marker => {
        marker.addEventListener('markerFound', function () {
            const markerId = marker.getAttribute('id');
            const nodeId = markerToNodeMap[markerId];

            if (nodeId) {
                console.log(`Marker Found: ${markerId} → Node: ${nodeId}`);
                // Update the user's position based on the marker
                updateUserLocation(nodeId);
            }
        });

        marker.addEventListener('markerLost', function () {
            const markerId = marker.getAttribute('id');
            console.log(`Marker Lost: ${markerId}`);
            // Handle marker loss, possibly remove or update user location
        });
    });
}

// Function to update the user's location and trigger pathfinding
function updateUserLocation(nodeId) {
    // Example: Update the user's location
    window.currentUserLocation = nodeId;
    console.log("User's location updated to:", nodeId);

    // Assuming you're using Dijkstra's algorithm to find the shortest path
    const result = findShortestPath(nodeId, "Room2");  // Example destination
    console.log("Shortest path from", nodeId, "to Room2:", result.path);
    console.log("Total distance:", result.distance, "m");
}

// Call this function to start detecting markers
setupMarkerEvents();

// Pathfinding function (example using Dijkstra)
function findShortestPath(start, end) {
    const graph = buildGraph(window.extractedNodes, window.extractedEdges);
    const distances = {};
    const previous = {};
    const nodes = new Set(window.extractedNodes.map(n => n.id));

    // Initialize distances and previous nodes
    window.extractedNodes.forEach(node => {
        distances[node.id] = Infinity;
        previous[node.id] = null;
    });
    distances[start] = 0;

    // Run Dijkstra's algorithm
    while (nodes.size) {
        const currentNode = getClosestNode(nodes, distances);
        nodes.delete(currentNode);

        if (currentNode === end) {
            break;
        }

        const neighbors = graph[currentNode] || [];
        neighbors.forEach(neighbor => {
            const alt = distances[currentNode] + getEdgeWeight(currentNode, neighbor);
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = currentNode;
            }
        });
    }

    // Reconstruct the shortest path
    const path = [];
    let current = end;
    while (previous[current]) {
        path.unshift(current);
        current = previous[current];
    }

    return { path, distance: distances[end] };
}

// Helper functions
function getClosestNode(nodes, distances) {
    let minDist = Infinity;
    let closestNode = null;

    nodes.forEach(node => {
        if (distances[node] < minDist) {
            minDist = distances[node];
            closestNode = node;
        }
    });

    return closestNode;
}

function getEdgeWeight(from, to) {
    // Placeholder logic for edge weight (e.g., distance between nodes)
    return 10;  // Adjust based on actual graph logic
}

// Function to build the graph from extracted nodes and edges
function buildGraph(nodes, edges) {
    let graph = {};
    nodes.forEach(node => {
        graph[node.id] = [];
    });

    edges.forEach(edge => {
        graph[edge.from].push(edge.to);
        graph[edge.to].push(edge.from); // Assuming bidirectional edges
    });

    return graph;
}
