import { ScenarioNode, LayerType } from "../types/topology";

/**
 * Layer Y positions for node placement
 */
const LAYER_Y: Record<LayerType, number> = {
  IT: 200,   // Top layer
  DMZ: 0,    // Middle layer
  OT: -200,  // Bottom layer
};

/**
 * Spacing between nodes horizontally
 */
const NODE_SPACING = 150;

/**
 * Vertical offset for child nodes
 */
const CHILD_Y_OFFSET = 100;

/**
 * Calculate X position for a node based on its index and total count
 */
function calculateX(index: number, count: number): number {
  // Center nodes around x=0
  // Formula: X = (index - (count-1)/2) * spacing
  return (index - (count - 1) / 2) * NODE_SPACING;
}

/**
 * Calculate positions for all nodes in a layer
 */
export function calculateLayerPositions(
  nodes: ScenarioNode[],
  layer: LayerType
): ScenarioNode[] {
  const y = LAYER_Y[layer];
  const count = nodes.length;

  return nodes.map((node, index) => ({
    ...node,
    x: calculateX(index, count),
    y,
    layer,
  }));
}

/**
 * Calculate positions for child nodes under a parent
 */
export function calculateChildPositions(
  parentNode: ScenarioNode,
  children: ScenarioNode[]
): ScenarioNode[] {
  const parentX = parentNode.x;
  const parentY = parentNode.y;
  const count = children.length;

  return children.map((child, index) => ({
    ...child,
    x: parentX + calculateX(index, count),
    y: parentY - CHILD_Y_OFFSET,
  }));
}

/**
 * Recursively calculate positions for a node and all its children
 */
function calculateNodePositionsRecursive(
  node: ScenarioNode,
  depth: number = 0
): ScenarioNode {
  if (!node.children || node.children.length === 0) {
    return node;
  }

  // Position children relative to parent
  const positionedChildren = node.children.map((child, index) => {
    const count = node.children!.length;
    const childNode: ScenarioNode = {
      ...child,
      x: node.x + calculateX(index, count),
      y: node.y - CHILD_Y_OFFSET,
    };
    // Recursively position grandchildren
    return calculateNodePositionsRecursive(childNode, depth + 1);
  });

  return {
    ...node,
    children: positionedChildren,
  };
}

/**
 * Calculate positions for all nodes in a scenario
 * Organizes by layer (IT/DMZ/OT) and handles recursive children
 */
export function calculateAllPositions(
  itNodes: ScenarioNode[],
  dmzNodes: ScenarioNode[],
  otNodes: ScenarioNode[]
): {
  itNodes: ScenarioNode[];
  dmzNodes: ScenarioNode[];
  otNodes: ScenarioNode[];
} {
  // Calculate layer positions
  const positionedIT = calculateLayerPositions(itNodes, "IT").map((n) =>
    calculateNodePositionsRecursive(n)
  );
  const positionedDMZ = calculateLayerPositions(dmzNodes, "DMZ").map((n) =>
    calculateNodePositionsRecursive(n)
  );
  const positionedOT = calculateLayerPositions(otNodes, "OT").map((n) =>
    calculateNodePositionsRecursive(n)
  );

  return {
    itNodes: positionedIT,
    dmzNodes: positionedDMZ,
    otNodes: positionedOT,
  };
}

/**
 * Flatten all nodes from a hierarchical structure into a flat array
 * Useful for building links and sending to the API
 */
export function flattenNodes(nodes: ScenarioNode[]): ScenarioNode[] {
  const result: ScenarioNode[] = [];

  function addNode(node: ScenarioNode) {
    // Add the node without children (children are added separately)
    const { children, ...nodeWithoutChildren } = node;
    result.push(nodeWithoutChildren as ScenarioNode);

    // Recursively add children
    if (children && children.length > 0) {
      children.forEach(addNode);
    }
  }

  nodes.forEach(addNode);
  return result;
}

/**
 * Auto-generate switch nodes for the DMZ layer based on IT and OT nodes
 */
export function generateSwitchNodes(
  itNodes: ScenarioNode[],
  otNodes: ScenarioNode[],
  switchTemplateKey: string
): ScenarioNode[] {
  const switches: ScenarioNode[] = [];

  // Create IT-Switch if there are IT nodes
  if (itNodes.length > 0) {
    switches.push({
      name: "IT-Switch",
      template_key: switchTemplateKey,
      x: -75, // Will be recalculated
      y: 0,
      layer: "DMZ",
      scripts: [],
    });
  }

  // Create OT-Switch if there are OT nodes
  if (otNodes.length > 0) {
    switches.push({
      name: "OT-Switch",
      template_key: switchTemplateKey,
      x: 75, // Will be recalculated
      y: 0,
      layer: "DMZ",
      scripts: [],
    });
  }

  return switches;
}
