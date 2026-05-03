import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { COLORS, DATA, DESCRIPTIONS, TAG_TYPE_EXAMPLES } from './data';
import { CONNECTIONS } from './connections';
import type { ConnectionDatum } from './connections';
import type { HierarchyDatum, TagFamily } from './data';

interface ArcFrame {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

type D3Node = d3.HierarchyRectangularNode<HierarchyDatum>;
type ChartNode = D3Node & {
  current: ArcFrame;
  target: ArcFrame;
};

type ViewMode = 'map' | 'connections';

interface IndexedHierarchyNode {
  id: string;
  name: string;
  depth: number;
  parentId: string | null;
  categoryId: string | null;
  ancestorIds: string[];
}

type IndexedConnection = ConnectionDatum & {
  key: string;
};

const SIDEBAR_SECTIONS = [
  { title: 'Classic', items: ['strategy', 'digital', 'content', 'analytics', 'brand', 'channels', 'paid', 'community', 'physical'] },
  { title: 'Modern Growth', items: ['product_growth', 'lifecycle', 'growth_lab', 'creator'] },
  { title: 'Channels', items: ['mobile', 'earned_media', 'retail_media'] },
  { title: 'Infrastructure', items: ['data_infra', 'ai_marketing'] },
  { title: 'Commercial', items: ['commerce', 'demand_gen'] },
];

const TAG_FAMILY_LABELS: Record<TagFamily, string> = {
  category: 'category area',
  tactic: 'marketing tactic',
  tech_solution: 'tech system',
  general_tool: 'general tool',
  workflow: 'workflow or repeatable execution pattern',
  framework: 'framework or planning model',
  channel_surface: 'channel or platform surface',
  content_format: 'content format',
  metric: 'measurement concept',
};

const TAG_FAMILY_USE_CASES: Record<TagFamily, string> = {
  category: 'to understand how this part of marketing is organised and what kinds of execution sit inside it',
  tactic: 'to run a defined piece of marketing work with a clearer repeatable method',
  tech_solution: 'to execute the tactic at scale, automate steps, centralise data, or reduce manual coordination',
  general_tool: 'to carry out the tactic through a concrete execution method, media unit, asset, or operational instrument',
  workflow: 'to make execution repeatable, timed correctly, and consistent across campaigns or lifecycle stages',
  framework: 'to structure decisions, prioritise tradeoffs, and diagnose what to improve before execution',
  channel_surface: 'to win attention inside a specific distribution surface where the audience already spends time',
  content_format: 'to deliver the message in a format that matches how the audience prefers to consume it',
  metric: 'to measure whether the tactic is actually working and to know what to optimise next',
};

const TAG_FAMILY_DIFFERENTIATORS: Record<TagFamily, string> = {
  category: 'It is useful because it gives teams a clearer map of where decisions and tools belong.',
  tactic: 'It is useful because it turns a broad goal into an executable area of work.',
  tech_solution: 'You need this kind of tool when spreadsheets, manual handoffs, or disconnected systems start slowing down execution.',
  general_tool: 'You need this kind of tool when the work depends on a specific execution vehicle, placement, asset, or practical delivery mechanism rather than on software infrastructure.',
  workflow: 'You need this kind of element when success depends on sequence, timing, and consistency more than on one standalone platform.',
  framework: 'You need this kind of tool when the main problem is not execution speed but choosing the right direction, lens, or prioritisation logic.',
  channel_surface: 'You need this kind of surface when performance depends on how a platform distributes attention, not just on the creative itself.',
  content_format: 'You need this when the format itself changes comprehension, engagement, or response rate.',
  metric: 'You need this when better measurement is the bottleneck to making smarter decisions.',
};

const TECH_SYSTEM_KEYWORDS = [
  'ai', 'api', 'sdk', 'crm', 'ads', 'analytics', 'platform', 'studio', 'console', 'manager', 'pixel', 'cloud',
  'automation', 'software', 'app', 'search ads', 'bi', '.io', 'gtm'
];

const GENERAL_TOOL_KEYWORDS = [
  'billboard', 'wrap', 'booth', 'postcard', 'catalogue', 'mail', 'display', 'stage', 'wristband', 'sampling',
  'station', 'stall', 'store', 'shop', 'pack', 'insert', 'kiosk', 'flash mob', 'projection', 'art', 'poster',
  'playbook', 'guide', 'interviews', 'survey', 'keyword', 'screenshots', 'video', 'story', 'brief', 'pricing',
  'timeline', 'score', 'intent', 'quality', 'briefs', 'calculator', 'qr', 'bundle', 'signage'
];

function getTopLevelCategoryId(node: D3Node | null) {
  if (!node || node.depth === 0) return null;

  let ancestor = node;
  while (ancestor.depth > 1 && ancestor.parent) {
    ancestor = ancestor.parent;
  }

  return ancestor.data.id;
}

function getFirstSentence(text: string | undefined) {
  if (!text) return '';
  const match = text.match(/^.*?[.!?](?:\s|$)/);
  return (match ? match[0] : text).trim();
}

function inferLeafTagFamily(node: D3Node): TagFamily {
  const explicitFamily = TAG_TYPE_EXAMPLES[node.data.id];
  if (explicitFamily) return explicitFamily;

  const normalizedName = node.data.name.replace(/\n/g, ' ').toLowerCase();
  const normalizedId = node.data.id.toLowerCase();
  const haystack = `${normalizedName} ${normalizedId}`;

  if (GENERAL_TOOL_KEYWORDS.some(keyword => haystack.includes(keyword))) {
    return 'general_tool';
  }

  if (TECH_SYSTEM_KEYWORDS.some(keyword => haystack.includes(keyword))) {
    return 'tech_solution';
  }

  return 'general_tool';
}

const HIERARCHY_INDEX = new Map<string, IndexedHierarchyNode>();

function indexHierarchy(node: HierarchyDatum, parentId: string | null = null, depth = 0, ancestorIds: string[] = [], categoryId: string | null = null) {
  const nextCategoryId = depth === 1 ? node.id : categoryId;

  HIERARCHY_INDEX.set(node.id, {
    id: node.id,
    name: node.name.replace(/\n/g, ' '),
    depth,
    parentId,
    categoryId: nextCategoryId,
    ancestorIds,
  });

  node.children?.forEach(child => {
    indexHierarchy(child, node.id, depth + 1, [...ancestorIds, node.id], nextCategoryId);
  });
}

indexHierarchy(DATA);

const CONNECTION_GRAPH_LINKS = CONNECTIONS
  .filter(connection => HIERARCHY_INDEX.has(connection.sourceId) && HIERARCHY_INDEX.has(connection.targetId))
  .map(connection => ({
    ...connection,
    key: `${connection.sourceId}:${connection.targetId}:${connection.label}`,
  }));

function isWithinBranch(nodeId: string, branchId: string) {
  const node = HIERARCHY_INDEX.get(nodeId);
  if (!node) return false;
  return node.id === branchId || node.ancestorIds.includes(branchId);
}

function addNodeWithAncestors(nodeId: string, activeNodeIds: Set<string>) {
  const node = HIERARCHY_INDEX.get(nodeId);
  if (!node) return;

  activeNodeIds.add(node.id);
  node.ancestorIds.forEach(ancestorId => activeNodeIds.add(ancestorId));
}

function getConnectionFocusState(focusId: string | null) {
  if (!focusId) {
    return {
      activeNodeIds: CONNECTION_GRAPH_LINKS.reduce((activeNodeIds, link) => {
        addNodeWithAncestors(link.sourceId, activeNodeIds);
        addNodeWithAncestors(link.targetId, activeNodeIds);
        return activeNodeIds;
      }, new Set<string>()),
      activeLinkKeys: new Set(CONNECTION_GRAPH_LINKS.map(link => link.key)),
      relatedConnections: CONNECTION_GRAPH_LINKS,
    };
  }

  const activeNodeIds = new Set<string>();
  const activeLinkKeys = new Set<string>();
  const relatedConnections = CONNECTION_GRAPH_LINKS.filter(link => {
    const matches = isWithinBranch(link.sourceId, focusId) || isWithinBranch(link.targetId, focusId);
    if (!matches) return false;

    addNodeWithAncestors(link.sourceId, activeNodeIds);
    addNodeWithAncestors(link.targetId, activeNodeIds);
    activeLinkKeys.add(link.key);
    return true;
  });

  addNodeWithAncestors(focusId, activeNodeIds);

  return { activeNodeIds, activeLinkKeys, relatedConnections };
}

export default function App({ onNavigateToQuiz }: { onNavigateToQuiz: () => void }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const pathRef = useRef<d3.Selection<SVGPathElement, ChartNode, SVGGElement, unknown> | null>(null);
  const labelRef = useRef<d3.Selection<SVGTextElement, ChartNode, SVGGElement, unknown> | null>(null);
  const connectionPathRef = useRef<d3.Selection<SVGPathElement, IndexedConnection, SVGGElement, unknown> | null>(null);
  const rootNodeRef = useRef<ChartNode | null>(null);
  const nodeByIdRef = useRef<Map<string, ChartNode>>(new Map());
  const currentViewIdRef = useRef('marketing');
  const currentViewDepthRef = useRef(0);
  const selectedIdRef = useRef<string | null>(null);
  const viewModeRef = useRef<ViewMode>('map');
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const zoomToRef = useRef<((viewNode: ChartNode, nextSelectedId?: string | null) => void) | null>(null);
  const renderConnectionsRef = useRef<((useTarget?: boolean, transition?: d3.Transition<SVGGElement, unknown, null, undefined>) => void) | null>(null);

  const [currentViewId, setCurrentViewId] = useState('marketing');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [totalNodes, setTotalNodes] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [isConnectionsPanelOpen, setIsConnectionsPanelOpen] = useState(true);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    viewModeRef.current = viewMode;
    renderConnectionsRef.current?.();
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'connections') {
      setIsConnectionsPanelOpen(true);
    }
  }, [viewMode]);

  useEffect(() => {
    if (!chartRef.current) return;

    const width = window.innerWidth - 180;
    const height = window.innerHeight - 104;
    const radius = Math.min(width, height) / 2 - 58;

    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('font-family', 'IBM Plex Sans, sans-serif');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    svgRef.current = svg;

    const root = d3.hierarchy<HierarchyDatum>(DATA)
      .sum(d => (d._leaf ? 1 : 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0)) as ChartNode;

    d3.partition<HierarchyDatum>().size([2 * Math.PI, radius])(root);

    const allNodes = root.descendants() as ChartNode[];
    const nodeById = new Map<string, ChartNode>();

    allNodes.forEach(node => {
      node.current = { x0: node.x0, x1: node.x1, y0: node.y0, y1: node.y1 };
      node.target = { ...node.current };
      nodeById.set(node.data.id, node);
    });

    rootNodeRef.current = root;
    nodeByIdRef.current = nodeById;
    currentViewIdRef.current = root.data.id;
    currentViewDepthRef.current = root.depth;
    selectedIdRef.current = null;
    setCurrentViewId(root.data.id);
    setSelectedId(null);
    setHoveredId(null);
    setTotalNodes(allNodes.length - 1);

    const arc = d3.arc<ChartNode>()
      .startAngle(node => node.current.x0)
      .endAngle(node => node.current.x1)
      .padAngle(node => Math.min((node.current.x1 - node.current.x0) / 2, 0.005))
      .padRadius(radius / 2)
      .innerRadius(node => node.current.y0)
      .outerRadius(node => Math.max(node.current.y0 + 1, node.current.y1 - 1));

    const getColor = (node: D3Node) => {
      if (node.depth === 0) return 'transparent';
      const categoryId = getTopLevelCategoryId(node);
      const baseColor = COLORS[categoryId || ''] || '#ccc';

      if (node.depth === 1) return baseColor;
      if (node.depth === 2) return d3.color(baseColor)?.brighter(0.3).formatHex() || baseColor;
      return d3.color(baseColor)?.brighter(0.8).formatHex() || baseColor;
    };

    const getFrame = (node: ChartNode, useTarget = false) => (useTarget ? node.target : node.current);

    const getLabelLines = (node: ChartNode) => {
      const explicitLines = node.data.name.split('\n').map(part => part.trim()).filter(Boolean);
      if (explicitLines.length > 1) return explicitLines;

      const words = node.data.name.replace(/\s+/g, ' ').trim().split(' ');
      const maxChars = node.depth === 1 ? 14 : node.depth === 2 ? 12 : 10;
      const maxLines = node.depth === 1 ? 2 : 3;
      const lines: string[] = [];
      let currentLine = '';

      words.forEach(word => {
        const nextLine = currentLine ? `${currentLine} ${word}` : word;
        if (!currentLine || nextLine.length <= maxChars) {
          currentLine = nextLine;
          return;
        }

        lines.push(currentLine);
        currentLine = word;
      });

      if (currentLine) lines.push(currentLine);
      if (lines.length <= maxLines) return lines;

      const visibleLines = lines.slice(0, maxLines);
      const lastLine = visibleLines[maxLines - 1];
      visibleLines[maxLines - 1] = lastLine.length > maxChars - 1
        ? `${lastLine.slice(0, maxChars - 2)}…`
        : `${lastLine}…`;
      return visibleLines;
    };

    const getLabelLayout = (node: ChartNode, useTarget = false) => {
      const frame = getFrame(node, useTarget);
      const lines = getLabelLines(node);
      const isRootView = currentViewIdRef.current === 'marketing';
      const currentViewDepth = currentViewDepthRef.current;
      const isFocusedDetailView = currentViewDepth >= 1;
      const isImmediateDetailLayer = isFocusedDetailView && node.depth <= currentViewDepth + 1;
      const angle = frame.x1 - frame.x0;
      const radiusMid = (frame.y0 + frame.y1) / 2;
      const arcLength = Math.max(0, angle * radiusMid - 10);
      const radialSpace = Math.max(0, frame.y1 - frame.y0 - 8);
      const maxLineLength = Math.max(...lines.map(line => line.length), 1);
      const baseFontSize = isRootView
        ? node.depth === 1 ? 13 : node.depth === 2 ? 8 : 5.5
        : isImmediateDetailLayer
          ? node.depth === 1 ? 13 : node.depth === 2 ? 9 : 6.5
        : node.depth === 1 ? 13 : node.depth === 2 ? 10 : 8;
      const minFontSize = isRootView
        ? node.depth === 1 ? 8 : node.depth === 2 ? 5 : 4
        : isImmediateDetailLayer
          ? node.depth === 1 ? 8 : node.depth === 2 ? 5.5 : 4.5
        : node.depth === 1 ? 8 : 7;
      const widthConstrainedSize = arcLength / Math.max(maxLineLength * 0.56, 1);
      const heightConstrainedSize = radialSpace / Math.max(lines.length * 1.15, 1);
      const fontSize = Math.min(baseFontSize, widthConstrainedSize, heightConstrainedSize);
      const visible = isRootView
        ? node.depth > 0
        : isImmediateDetailLayer
          ? angle > 0.01 && arcLength > 8 && radialSpace > 8
        : node.depth === 1
          ? angle > 0.018 && arcLength > 14 && radialSpace > 10
          : angle > 0.03 && arcLength > 22 && radialSpace > 12 && fontSize >= minFontSize;

      return {
        lines,
        fontSize: Math.max(minFontSize, Math.min(baseFontSize, fontSize)),
        visible,
      };
    };

    const getLabelTransform = (node: ChartNode, useTarget = false) => {
      const frame = getFrame(node, useTarget);
      const x = ((frame.x0 + frame.x1) / 2) * 180 / Math.PI;
      const y = (frame.y0 + frame.y1) / 2;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    };

    const applyLabelLines = (selection: d3.Selection<SVGTextElement, ChartNode, SVGGElement, unknown>) => {
      selection.each(function(node) {
        const text = d3.select(this);
        const { lines } = getLabelLayout(node);

        text.selectAll('tspan').remove();

        lines.forEach((line, index) => {
          const startOffset = lines.length === 1 ? '0em' : `${-0.55 * (lines.length - 1)}em`;
          text.append('tspan')
            .attr('x', 0)
            .attr('dy', index === 0 ? startOffset : '1.1em')
            .text(line);
        });
      });
    };

    const resetPathOpacity = () => {
      if (viewModeRef.current === 'connections') {
        renderConnectionsRef.current?.();
        return;
      }

      pathRef.current?.style('opacity', 0.9);
      labelRef.current?.style('opacity', node => (getLabelLayout(node).visible ? 1 : 0));
    };

    const highlightSequence = (node: ChartNode) => {
      const sequence = node.ancestors();
      pathRef.current?.style('opacity', 0.22);
      pathRef.current?.filter(candidate => sequence.includes(candidate)).style('opacity', 1);
      labelRef.current?.style('opacity', candidate => {
        if (!getLabelLayout(candidate).visible) return 0;
        return sequence.includes(candidate) ? 1 : 0.18;
      });
    };

    const getNodePoint = (node: ChartNode, useTarget = false) => {
      const frame = getFrame(node, useTarget);
      const angle = (frame.x0 + frame.x1) / 2 - Math.PI / 2;
      const radiusAtPoint = Math.max(frame.y0 + 6, frame.y1 - 7);

      return {
        x: Math.cos(angle) * radiusAtPoint,
        y: Math.sin(angle) * radiusAtPoint,
      };
    };

    const getPolarPoint = (angle: number, radialDistance: number) => ({
      x: Math.cos(angle) * radialDistance,
      y: Math.sin(angle) * radialDistance,
    });

    const normalizeAngle = (angle: number) => {
      const cycle = Math.PI * 2;
      return ((angle % cycle) + cycle) % cycle;
    };

    const getLaneOffset = (key: string) => {
      let hash = 0;
      for (let index = 0; index < key.length; index += 1) {
        hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
      }

      return hash % 5;
    };

    const getConnectionPath = (link: IndexedConnection, sourceNode: ChartNode, targetNode: ChartNode, useTarget = false) => {
      const sourcePoint = getNodePoint(sourceNode, useTarget);
      const targetPoint = getNodePoint(targetNode, useTarget);
      const sourceFrame = getFrame(sourceNode, useTarget);
      const targetFrame = getFrame(targetNode, useTarget);
      const sourceAngle = normalizeAngle((sourceFrame.x0 + sourceFrame.x1) / 2 - Math.PI / 2);
      const targetAngle = normalizeAngle((targetFrame.x0 + targetFrame.x1) / 2 - Math.PI / 2);
      const clockwiseDistance = (targetAngle - sourceAngle + Math.PI * 2) % (Math.PI * 2);
      const counterClockwiseDistance = (sourceAngle - targetAngle + Math.PI * 2) % (Math.PI * 2);
      const useClockwise = clockwiseDistance <= counterClockwiseDistance;
      const travelDistance = Math.min(clockwiseDistance, counterClockwiseDistance);
      const sweepFlag = useClockwise ? 1 : 0;
      const largeArcFlag = travelDistance > Math.PI ? 1 : 0;
      const laneOffset = getLaneOffset(link.key);
      const sourceCategory = HIERARCHY_INDEX.get(link.sourceId)?.categoryId;
      const targetCategory = HIERARCHY_INDEX.get(link.targetId)?.categoryId;
      const crossCategoryBonus = sourceCategory !== targetCategory ? 10 : 0;
      const outerRadius = radius + 18 + Math.min(72, travelDistance * 22) + laneOffset * 9 + crossCategoryBonus;
      const sourceOuter = getPolarPoint(sourceAngle, outerRadius);
      const targetOuter = getPolarPoint(targetAngle, outerRadius);

      return [
        `M ${sourcePoint.x} ${sourcePoint.y}`,
        `L ${sourceOuter.x} ${sourceOuter.y}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} ${sweepFlag} ${targetOuter.x} ${targetOuter.y}`,
        `L ${targetPoint.x} ${targetPoint.y}`,
      ].join(' ');
    };

    const computeTargetFrame = (node: ChartNode, focusNode: ChartNode): ArcFrame => ({
      x0: Math.max(0, Math.min(1, (node.x0 - focusNode.x0) / (focusNode.x1 - focusNode.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (node.x1 - focusNode.x0) / (focusNode.x1 - focusNode.x0))) * 2 * Math.PI,
      y0: Math.max(0, node.y0 - focusNode.depth * (radius / 3)),
      y1: Math.max(0, node.y1 - focusNode.depth * (radius / 3)),
    });

    const path = g.append('g')
      .selectAll('path')
      .data(allNodes.filter(node => node.depth > 0))
      .join('path')
      .attr('fill', node => getColor(node))
      .attr('stroke', node => (node.depth === 3 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'))
      .attr('stroke-width', node => (node.depth === 3 ? 1.5 : 0.5))
      .attr('d', node => arc(node) || '')
      .attr('class', 'cursor-pointer transition-opacity duration-200')
      .style('opacity', 0.9)
      .on('mouseenter', (_event, node) => {
        setHoveredId(node.data.id);
        highlightSequence(node);
      })
      .on('mouseleave', () => {
        setHoveredId(null);
        resetPathOpacity();
      });

    pathRef.current = path;
    const connectionLayer = g.append('g').attr('fill', 'none').attr('pointer-events', 'none');

    const label = g.append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .selectAll('text')
      .data(allNodes.filter(node => node.depth > 0))
      .join('text')
      .attr('transform', node => getLabelTransform(node))
      .attr('dominant-baseline', 'middle')
      .attr('fill', node => {
        const background = d3.color(getColor(node));
        if (!background) return '#000';
        const rgb = background as { r: number; g: number; b: number };
        const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return yiq >= 128 ? '#1a1a1a' : '#ffffff';
      })
      .style('opacity', node => (getLabelLayout(node).visible ? 1 : 0))
      .style('font-size', node => `${getLabelLayout(node).fontSize}px`)
      .style('font-weight', node => (node.depth === 1 ? '600' : '500'))
      .style('font-family', 'IBM Plex Sans, sans-serif')
      .style('letter-spacing', '0.01em')
      .call(applyLabelLines);

    labelRef.current = label;

    const renderConnectionOverlay = (useTarget = false, transition?: d3.Transition<SVGGElement, unknown, null, undefined>) => {
      const focusId = selectedIdRef.current || (currentViewIdRef.current !== 'marketing' ? currentViewIdRef.current : null);
      const { activeNodeIds, activeLinkKeys } = getConnectionFocusState(focusId);
      const connectedLinks = CONNECTION_GRAPH_LINKS.filter(link => {
        const sourceNode = nodeById.get(link.sourceId);
        const targetNode = nodeById.get(link.targetId);
        return Boolean(sourceNode && targetNode && sourceNode.depth === 3 && targetNode.depth === 3);
      });

      const connectionSelection = connectionLayer
        .selectAll<SVGPathElement, IndexedConnection>('path')
        .data(connectedLinks, link => link.key)
        .join('path')
        .attr('stroke', link => {
          const sourceCategory = HIERARCHY_INDEX.get(link.sourceId)?.categoryId;
          return sourceCategory ? COLORS[sourceCategory] || '#8a8880' : '#8a8880';
        })
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', link => 1 + ((link.strength ?? 0.7) - 0.5) * 1.8);

      const applyConnectionState = (selection: d3.Selection<SVGPathElement, IndexedConnection, SVGGElement, unknown>, shouldUseTarget: boolean) => {
        selection
          .attr('d', link => getConnectionPath(link, nodeById.get(link.sourceId) as ChartNode, nodeById.get(link.targetId) as ChartNode, shouldUseTarget))
          .style('opacity', link => {
            if (viewModeRef.current !== 'connections') return 0;
            if (!focusId) return 0.42;
            return activeLinkKeys.has(link.key) ? 0.92 : 0.06;
          });
      };

      if (transition) {
        applyConnectionState(connectionSelection.transition(transition), useTarget);
      } else {
        applyConnectionState(connectionSelection, useTarget);
      }

      connectionPathRef.current = connectionSelection;

      pathRef.current?.style('opacity', node => {
        if (viewModeRef.current !== 'connections') return 0.9;
        return activeNodeIds.has(node.data.id) ? 0.94 : 0.16;
      });

      labelRef.current?.style('opacity', node => {
        if (!getLabelLayout(node, useTarget).visible) return 0;
        if (viewModeRef.current !== 'connections') return 1;
        return activeNodeIds.has(node.data.id) ? 1 : 0.2;
      });
    };

    renderConnectionsRef.current = renderConnectionOverlay;
    renderConnectionOverlay();

    const zoomToNode = (viewNode: ChartNode, nextSelectedId: string | null = viewNode.depth === 0 ? null : viewNode.data.id) => {
      currentViewIdRef.current = viewNode.data.id;
      currentViewDepthRef.current = viewNode.depth;
      selectedIdRef.current = nextSelectedId;
      setCurrentViewId(viewNode.data.id);
      setSelectedId(nextSelectedId);
      setHoveredId(null);
      resetPathOpacity();

      allNodes.forEach(node => {
        node.target = computeTargetFrame(node, viewNode);
      });

      const transition = g.transition().duration(750);

      path.transition(transition)
        .tween('arc-frame', node => {
          const interpolate = d3.interpolate(node.current, node.target);
          return progress => {
            node.current = interpolate(progress);
          };
        })
        .attrTween('d', node => () => arc(node) || '');

      label.transition(transition)
        .attr('transform', node => getLabelTransform(node, true))
        .style('opacity', node => (getLabelLayout(node, true).visible ? 1 : 0))
        .style('font-size', node => `${getLabelLayout(node, true).fontSize}px`);

      renderConnectionOverlay(true, transition);
    };

    zoomToRef.current = zoomToNode;

    path.on('click', (_event, node) => {
      if (node.children) {
        zoomToNode(node);
        return;
      }

      zoomToNode((node.parent as ChartNode | null) || root, node.data.id);
    });

    g.append('circle')
      .attr('r', root.y1)
      .attr('fill', 'transparent')
      .attr('cursor', 'pointer')
      .on('click', () => {
        zoomToNode(root, null);
      });

    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on('zoom', event => {
        g.attr('transform', `translate(${width / 2 + event.transform.x},${height / 2 + event.transform.y}) scale(${event.transform.k})`);
      });

    svg.call(zoomBehavior);
    zoomBehaviorRef.current = zoomBehavior;

    const handleResize = () => {
      const nextWidth = window.innerWidth - 180;
      const nextHeight = window.innerHeight - 104;
      svg.attr('width', nextWidth).attr('height', nextHeight);
      const zoomTransform = d3.zoomTransform(svg.node() as SVGSVGElement);
      g.attr('transform', `translate(${nextWidth / 2 + zoomTransform.x},${nextHeight / 2 + zoomTransform.y}) scale(${zoomTransform.k})`);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    renderConnectionsRef.current?.();
  }, [currentViewId, selectedId]);

  const getNodeById = (id: string | null) => (id ? nodeByIdRef.current.get(id) || null : null);

  const rootNode = rootNodeRef.current;
  const currentViewNode = getNodeById(currentViewId) || rootNode;
  const selectedNode = getNodeById(selectedId);
  const hoveredNode = getNodeById(hoveredId);
  const displayNode = hoveredNode || selectedNode || currentViewNode || rootNode;
  const connectionsFocusId = selectedId || (currentViewId !== 'marketing' ? currentViewId : null);
  const { relatedConnections } = getConnectionFocusState(connectionsFocusId);

  const breadcrumbNodes = currentViewNode?.ancestors().reverse() ?? [];
  if (selectedNode && currentViewNode && selectedNode !== currentViewNode) {
    const selectedInsideCurrentView = selectedNode.ancestors().some(node => node === currentViewNode);
    if (selectedInsideCurrentView) {
      breadcrumbNodes.push(selectedNode);
    }
  }

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    svgRef.current.transition().duration(200).call(zoomBehaviorRef.current.scaleBy, 1.2);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    svgRef.current.transition().duration(200).call(zoomBehaviorRef.current.scaleBy, 1 / 1.2);
  };

  const getNodeColor = (node: D3Node | null) => {
    const categoryId = getTopLevelCategoryId(node);
    return categoryId ? COLORS[categoryId] || '#1a1a1a' : '#1a1a1a';
  };

  const getLayerName = (depth: number) => {
    if (depth === 1) return 'Category';
    if (depth === 2) return 'Tactic';
    if (depth === 3) return 'Tool';
    return '';
  };

  const getNodeTagFamily = (node: D3Node | null): TagFamily | null => {
    if (!node) return null;
    if (node.depth === 1) return 'category';
    if (node.depth === 2) return 'tactic';
    if (node.depth === 3) return inferLeafTagFamily(node);
    return null;
  };

  const getNodeTypeLabel = (node: D3Node | null) => {
    if (!node) return '';
    if (node.depth < 3) return getLayerName(node.depth);

    const family = getNodeTagFamily(node);
    if (!family) return getLayerName(node.depth);

    return TAG_FAMILY_LABELS[family]
      .replace(' or repeatable execution pattern', '')
      .replace(' or planning model', '')
      .replace(' area', '')
      .replace('marketing ', '')
      .replace('technology ', 'tech ')
      .replace('channel or ', '');
  };

  const handleSidebarClick = (categoryId: string) => {
    if (viewMode === 'connections') {
      setCurrentViewId(categoryId);
      setSelectedId(categoryId);
      setHoveredId(null);
      return;
    }

    const node = getNodeById(categoryId);
    if (!node) return;
    zoomToRef.current?.(node, node.data.id);
  };

  const isSidebarActive = (categoryId: string) => {
    const branchRoot = currentViewNode?.ancestors().find(node => node.depth === 1);
    return branchRoot?.data.id === categoryId;
  };

  const renderSidebarItem = (categoryId: string) => {
    const active = isSidebarActive(categoryId);

    return (
      <button
        key={categoryId}
        type="button"
        onClick={() => handleSidebarClick(categoryId)}
        className={`flex w-full items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium transition-colors border-l-2 ${active ? 'bg-black/[0.06] text-[#1a1a1a]' : 'text-[#8a8880] border-transparent hover:bg-black/5 hover:text-[#1a1a1a]'}`}
        style={{ borderLeftColor: active ? COLORS[categoryId] : 'transparent' }}
      >
        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: COLORS[categoryId] }}></div>
        <span className="capitalize">{categoryId.replace('_', ' ')}</span>
      </button>
    );
  };

  const handleBreadcrumbClick = (node: D3Node) => {
    if (viewMode === 'connections') {
      setCurrentViewId(node.data.id);
      setSelectedId(node.depth === 0 ? null : node.data.id);
      setHoveredId(null);
      return;
    }

    if (!rootNode) return;

    if (node.depth === 0) {
      zoomToRef.current?.(rootNode, null);
      return;
    }

    if (node.children) {
      zoomToRef.current?.(node as ChartNode, node.data.id);
      return;
    }

    const parentNode = (node.parent as ChartNode | null) || rootNode;
    zoomToRef.current?.(parentNode, node.data.id);
  };

  const handleBack = () => {
    if (!currentViewNode || !rootNode) return;

    if (viewMode === 'connections') {
      const sourceNode = selectedNode || currentViewNode;
      const parentNode = (sourceNode.parent as ChartNode | null) || rootNode;
      setCurrentViewId(parentNode.data.id);
      setSelectedId(parentNode.depth === 0 ? null : parentNode.data.id);
      setHoveredId(null);
      return;
    }

    const parentNode = (currentViewNode.parent as ChartNode | null) || rootNode;
    const nextSelectedId = parentNode.depth === 0 ? null : parentNode.data.id;
    zoomToRef.current?.(parentNode, nextSelectedId);
  };

  const getDescription = (node: D3Node | null) => {
    if (!node) return DESCRIPTIONS.marketing;
    if (DESCRIPTIONS[node.data.id]) return DESCRIPTIONS[node.data.id];

    const cleanName = node.data.name.replace('\n', ' ');
    const parentName = node.parent?.data.name.replace('\n', ' ');
    const grandparentName = node.parent?.parent?.data.name.replace('\n', ' ');
    const tacticDescription = getFirstSentence(node.parent ? DESCRIPTIONS[node.parent.data.id] : '');
    const categoryDescription = getFirstSentence(node.parent?.parent ? DESCRIPTIONS[node.parent.parent.data.id] : '');

    if (node.depth === 1) {
      return `${cleanName} is a primary layer in the marketing system. It groups related tactics, tools, and operating choices so teams can understand how this part of marketing contributes to overall growth.`;
    }

    if (node.depth === 2) {
      return `${cleanName} is a core tactic within ${parentName}. It gives the team a practical area of execution to plan, run, measure, and improve over time.`;
    }

    if (node.depth === 3) {
      const tagFamily = inferLeafTagFamily(node);
      const elementLabel = TAG_FAMILY_LABELS[tagFamily];
      const useCase = TAG_FAMILY_USE_CASES[tagFamily];
      const differentiator = TAG_FAMILY_DIFFERENTIATORS[tagFamily];
      const tacticContext = tacticDescription || `${parentName} is the tactic this tool supports.`;
      const categoryContext = categoryDescription ? ` Within ${grandparentName}, ${categoryDescription}` : '';

      return `${cleanName} is a ${elementLabel} used for ${parentName}. Use it when you need to ${useCase} for this tactic. ${tacticContext}${categoryContext} ${differentiator}`;
    }

    return 'No description available.';
  };

  return (
    <div className="flex flex-col h-screen bg-[#f4f1ec] text-[#1a1a1a] font-['IBM_Plex_Sans',sans-serif] overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-[#f4f1ec] border-b border-black/10 flex items-center px-4 gap-3">
        <h1 className="text-base font-semibold tracking-[0.01em] whitespace-nowrap">Marketing System</h1>
        <span className="text-black/20 text-base shrink-0">|</span>
        <span className="text-[10px] font-medium text-[#8a8880] tracking-[0.12em] uppercase whitespace-nowrap">
          {viewMode === 'map'
            ? 'Click segment to zoom · Click centre to reset · Scroll to zoom · Drag to pan'
            : 'Leaf-to-leaf connections · Click segment to focus · Scroll to zoom · Drag to pan'}
        </span>
        <div className="ml-auto flex items-center gap-1 rounded-md border border-black/10 bg-white p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] transition-colors rounded ${viewMode === 'map' ? 'bg-[#1a1a1a] text-white' : 'text-[#8a8880] hover:text-[#1a1a1a]'}`}
          >
            System Map
          </button>
          <button
            type="button"
            onClick={() => setViewMode('connections')}
            className={`px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] transition-colors rounded ${viewMode === 'connections' ? 'bg-[#1a1a1a] text-white' : 'text-[#8a8880] hover:text-[#1a1a1a]'}`}
          >
            Connections
          </button>
        </div>
        <button
          type="button"
          onClick={onNavigateToQuiz}
          className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] transition-colors rounded border border-black/15 text-[#8a8880] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] shrink-0 cursor-pointer"
        >
          Test knowledge
        </button>
        <div className="text-[10px] font-medium text-[#8a8880] tracking-[0.12em] uppercase whitespace-nowrap shrink-0">
          {viewMode === 'map' ? `${totalNodes} Nodes` : `${CONNECTIONS.length} Links`}
        </div>
      </header>

      <div className="flex flex-1 pt-12 pb-14">
        <aside className="w-[180px] bg-white border-r border-black/10 overflow-y-auto py-2.5 shrink-0 z-40 custom-scrollbar">
          {SIDEBAR_SECTIONS.map(section => (
            <React.Fragment key={section.title}>
              <div className="px-2.5 pt-3 first:pt-1.5 pb-0.5 text-[9px] font-medium text-[#8a8880] uppercase tracking-[0.18em] opacity-60">
                {section.title}
              </div>
              {section.items.map(renderSidebarItem)}
            </React.Fragment>
          ))}
        </aside>

        <main className="flex-1 relative flex items-center justify-center">
          <div className="absolute top-2 left-3 z-40 flex items-center gap-1 text-[10px] font-medium text-[#8a8880] uppercase tracking-[0.12em]">
            {breadcrumbNodes.map((node, index, nodes) => (
              <React.Fragment key={node.data.id}>
                <span className="cursor-pointer hover:text-[#1a1a1a] transition-colors" onClick={() => handleBreadcrumbClick(node)}>
                  {node.data.name.replace('\n', ' ')}
                </span>
                {index < nodes.length - 1 && <span className="opacity-30">/</span>}
              </React.Fragment>
            ))}
          </div>

          {viewMode === 'connections' && (
            <div className="absolute inset-y-3 right-3 z-40 flex items-start pointer-events-none">
              {!isConnectionsPanelOpen && (
                <button
                  type="button"
                  onClick={() => setIsConnectionsPanelOpen(true)}
                  className="pointer-events-auto mt-3 flex items-center gap-1 rounded-l-lg rounded-r-md border border-black/10 bg-white/95 px-2 py-2 text-[9px] font-medium uppercase tracking-[0.14em] text-[#6f6b63] shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-colors hover:text-[#1a1a1a]"
                >
                  <ChevronLeft size={14} /> Focus
                </button>
              )}

              <div
                className={`pointer-events-auto h-full w-[340px] max-w-[calc(100vw-220px)] rounded-xl border border-black/10 bg-white/95 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-transform duration-300 ${isConnectionsPanelOpen ? 'translate-x-0' : 'translate-x-[calc(100%+20px)]'}`}
              >
                <div className="flex h-full flex-col overflow-hidden">
                  <div className="flex items-start justify-between border-b border-black/10 px-4 py-3">
                    <div>
                      <div className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#8a8880]">Connection Focus</div>
                      <div className="mt-1 text-[14px] font-semibold text-[#1a1a1a]">
                        {displayNode?.data.name.replace('\n', ' ') || 'Cross-category system links'}
                      </div>
                      <div className="mt-1 text-[11px] leading-snug text-[#8a8880]">
                        {connectionsFocusId
                          ? `${relatedConnections.length} linked relationships found from this branch.`
                          : 'Showing the shared relationships that tie tools, tactics, and channels together across the map.'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsConnectionsPanelOpen(false)}
                      className="ml-3 flex h-8 w-8 items-center justify-center rounded-md border border-black/10 text-[#8a8880] transition-colors hover:bg-[#1a1a1a] hover:text-white"
                      aria-label="Hide connection focus panel"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
                    <div className="space-y-2">
                      {relatedConnections.slice(0, 8).map(connection => (
                        <div key={connection.key} className="rounded-lg bg-[#f4f1ec] px-2.5 py-2">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#1a1a1a]">
                            {HIERARCHY_INDEX.get(connection.sourceId)?.name || connection.sourceId} / {HIERARCHY_INDEX.get(connection.targetId)?.name || connection.targetId}
                          </div>
                          <div className="mt-0.5 text-[11px] leading-snug text-[#6f6b63]">{connection.label}</div>
                        </div>
                      ))}

                      {relatedConnections.length === 0 && (
                        <div className="rounded-lg bg-[#f4f1ec] px-3 py-3 text-[11px] leading-snug text-[#6f6b63]">
                          No active relationships are visible for this focus yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={chartRef} className="w-full h-full flex items-center justify-center" />

          <div className="absolute bottom-3 right-3 z-40 flex flex-col gap-1 items-end">
            {viewMode === 'map' ? (
              <>
                <div className="flex items-center gap-1.5 text-[9px] font-medium text-[#8a8880] tracking-[0.12em] uppercase">
                  <div className="w-5 h-1.5 rounded-sm bg-[#555]"></div>Category
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-medium text-[#8a8880] tracking-[0.12em] uppercase">
                  <div className="w-5 h-1.5 rounded-sm bg-[#999]"></div>Tactic
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-medium text-[#8a8880] tracking-[0.12em] uppercase">
                  <div className="w-5 h-1.5 rounded-sm bg-[#ccc]"></div>Tool
                </div>
                <div className="h-px bg-black/10 w-[60px] my-1"></div>
                <button onClick={handleZoomIn} className="w-6 h-6 bg-white border border-black/10 rounded flex items-center justify-center text-[#8a8880] hover:bg-[#1a1a1a] hover:text-white transition-colors self-end">
                  <ZoomIn size={14} />
                </button>
                <button onClick={handleZoomOut} className="w-6 h-6 bg-white border border-black/10 rounded flex items-center justify-center text-[#8a8880] hover:bg-[#1a1a1a] hover:text-white transition-colors self-end">
                  <ZoomOut size={14} />
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-[9px] font-medium text-[#8a8880] tracking-[0.12em] uppercase">
                  <div className="w-5 h-px bg-[#555]"></div>Leaf Connection
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-medium text-[#8a8880] tracking-[0.12em] uppercase">
                  <div className="w-5 h-1.5 rounded-sm bg-[#ccc]"></div>Linked Branch
                </div>
                <div className="text-[9px] font-medium text-[#8a8880] tracking-[0.12em] uppercase text-right max-w-[160px]">
                  Lines connect tool leaves across the same or different categories.
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-white border-t border-black/10 flex items-center px-5 gap-3">
        <div className="w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-300" style={{ background: getNodeColor(displayNode) }} />
        <div className="text-[15px] font-semibold tracking-[0.01em] whitespace-nowrap min-w-[130px]">
          {displayNode?.data.name.replace('\n', ' ') || 'Marketing System'}
        </div>

        {displayNode && displayNode.depth > 0 && (
          <div className="text-[9px] font-medium tracking-[0.14em] uppercase px-2 py-0.5 rounded-sm whitespace-nowrap shrink-0 border border-black/10 text-[#8a8880]">
            {getNodeTypeLabel(displayNode)}
          </div>
        )}

        <div className="w-px h-6 bg-black/10 shrink-0 mx-1"></div>

        <div className="text-[12px] text-[#8a8880] font-light leading-snug min-w-0 line-clamp-2">
          {getDescription(displayNode)}
        </div>

        {currentViewNode && currentViewNode.depth > 0 && (
          <button
            onClick={handleBack}
            className="ml-auto text-[10px] font-medium text-[#8a8880] shrink-0 uppercase tracking-[0.12em] border border-black/10 px-2.5 py-1 rounded cursor-pointer bg-transparent hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-all flex items-center gap-1"
          >
            <ArrowLeft size={12} /> Back
          </button>
        )}
      </footer>
    </div>
  );
}
