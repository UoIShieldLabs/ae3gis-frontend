import { ScenarioNode, LayerType } from "../types/topology";

/**
 * Layout configuration
 * GNS3 uses screen coordinates: positive Y = down, negative Y = up
 */
const LAYOUT = {
  // Layer Y positions (IT at top = negative Y, OT at bottom = positive Y)
  LAYER_Y: {
    IT: -300,    // Top layer (negative = up on screen)
    DMZ: 0,      // Middle layer
    OT: 300,     // Bottom layer (positive = down on screen)
  } as Record<LayerType, number>,
  
  // Switch positions (between layers)
  IT_SWITCH_Y: -150,   // Between IT devices and Firewall
  OT_SWITCH_Y: 150,    // Between Firewall and OT devices
  
  // Spacing
  NODE_SPACING: 150,          // Horizontal spacing between nodes
  CHILD_Y_OFFSET: 100,        // Vertical offset for child nodes
  MAX_NODES_PER_ROW: 6,       // Max nodes before wrapping to new row
  ROW_SPACING: 120,           // Vertical spacing between rows
};

/**
 * Calculate X position for a node based on its index in the row
 */
function calculateX(indexInRow: number, countInRow: number): number {
  // Center nodes around x=0
  return (indexInRow - (countInRow - 1) / 2) * LAYOUT.NODE_SPACING;
}

/**
 * Calculate row index for a node (for grid layout when many nodes)
 */
function getRowIndex(index: number): number {
  return Math.floor(index / LAYOUT.MAX_NODES_PER_ROW);
}

/**
 * Get count of nodes in a specific row
 */
function getCountInRow(totalCount: number, rowIndex: number): number {
  const fullRows = Math.floor(totalCount / LAYOUT.MAX_NODES_PER_ROW);
  if (rowIndex < fullRows) {
    return LAYOUT.MAX_NODES_PER_ROW;
  }
  return totalCount % LAYOUT.MAX_NODES_PER_ROW || LAYOUT.MAX_NODES_PER_ROW;
}

/**
 * Calculate positions for all nodes in a layer
 * Supports grid layout when there are many nodes
 */
export function calculateLayerPositions(
  nodes: ScenarioNode[],
  layer: LayerType
): ScenarioNode[] {
  const baseY = LAYOUT.LAYER_Y[layer];
  const count = nodes.length;

  return nodes.map((node, index) => {
    const rowIndex = getRowIndex(index);
    const indexInRow = index % LAYOUT.MAX_NODES_PER_ROW;
    const countInRow = getCountInRow(count, rowIndex);
    
    // For IT layer, additional rows go UP (more negative Y)
    // For OT layer, additional rows go DOWN (more positive Y)
    const rowOffset = layer === "IT" 
      ? -rowIndex * LAYOUT.ROW_SPACING 
      : rowIndex * LAYOUT.ROW_SPACING;
    
    return {
      ...node,
      x: calculateX(indexInRow, countInRow),
      y: baseY + rowOffset,
      layer,
    };
  });
}

/**
 * Calculate positions for child nodes under a parent
 * IT children go UP (more negative Y), OT children go DOWN (more positive Y)
 */
export function calculateChildPositions(
  parentNode: ScenarioNode,
  children: ScenarioNode[]
): ScenarioNode[] {
  const parentX = parentNode.x ?? 0;
  const parentY = parentNode.y ?? 0;
  const count = children.length;
  const layer = parentNode.layer;

  // Direction based on layer: IT goes up (-), OT goes down (+)
  const yDirection = layer === "OT" ? 1 : -1;

  return children.map((child, index) => ({
    ...child,
    x: parentX + calculateX(index, count),
    y: parentY + (yDirection * LAYOUT.CHILD_Y_OFFSET),
    layer: child.layer || layer,
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

  const layer = node.layer;
  // Direction based on layer: IT children go up (-), OT children go down (+)
  const yDirection = layer === "OT" ? 1 : -1;

  // Position children relative to parent
  const positionedChildren = node.children.map((child, index) => {
    const count = node.children!.length;
    const childNode: ScenarioNode = {
      ...child,
      x: (node.x ?? 0) + calculateX(index, count),
      y: (node.y ?? 0) + (yDirection * LAYOUT.CHILD_Y_OFFSET),
      layer: child.layer || layer,
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
 * Sets parent_name on children for link generation and API storage
 */
export function flattenNodes(nodes: ScenarioNode[], parentName?: string): ScenarioNode[] {
  const result: ScenarioNode[] = [];

  function addNode(node: ScenarioNode, parent?: string) {
    // Add the node without children, but with parent_name set
    const { children, ...nodeWithoutChildren } = node;
    const flatNode: ScenarioNode = {
      ...nodeWithoutChildren,
      parent_name: parent,
    } as ScenarioNode;
    result.push(flatNode);

    // Recursively add children with this node as parent
    if (children && children.length > 0) {
      children.forEach((child) => addNode(child, node.name));
    }
  }

  nodes.forEach((node) => addNode(node, parentName));
  return result;
}

/**
 * Auto-generate switch nodes for the DMZ layer based on IT and OT nodes
 * Switches are positioned vertically: IT-Switch above center, OT-Switch below
 */
export function generateSwitchNodes(
  itNodes: ScenarioNode[],
  otNodes: ScenarioNode[],
  switchTemplateKey: string
): ScenarioNode[] {
  const switches: ScenarioNode[] = [];

  // Create IT-Switch if there are IT nodes (positioned above firewall)
  if (itNodes.length > 0) {
    switches.push({
      name: "IT-Switch",
      template_key: switchTemplateKey,
      x: 0,
      y: LAYOUT.IT_SWITCH_Y,  // Between IT layer and DMZ center
      layer: "DMZ",
      scripts: [],
    });
  }

  // Create OT-Switch if there are OT nodes (positioned below firewall)
  if (otNodes.length > 0) {
    switches.push({
      name: "OT-Switch",
      template_key: switchTemplateKey,
      x: 0,
      y: LAYOUT.OT_SWITCH_Y,  // Between DMZ center and OT layer
      layer: "DMZ",
      scripts: [],
    });
  }

  return switches;
}
