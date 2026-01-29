import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { patientService } from '@/services/patient.service';
import { Brain, Maximize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PatientMindMapProps {
  patientId: string;
}

export function PatientMindMap({ patientId }: PatientMindMapProps) {
  const { toast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Store the ID of the clicked node to highlight its subtree
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  console.log('Rendering PatientMindMap for:', patientId);
  const { data, isLoading } = useQuery({
    queryKey: ['patient', patientId, 'mindmap'],
    queryFn: () => patientService.getPatientMindMap(patientId),
    staleTime: 0,
    refetchOnMount: true,
  });

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    const nodesList: Node[] = [];
    const edgesList: Edge[] = [];

    // Helper for edge styles
    const getEdgeStyle = (isHighlighted: boolean, defaultColor: string = 'hsl(var(--muted-foreground))') => {
      return {
        stroke: isHighlighted ? 'hsl(var(--primary))' : defaultColor,
        strokeWidth: isHighlighted ? 2.5 : 1, // Thicker if highlighted
        strokeDasharray: isHighlighted ? '5,5' : 'none', // Dotted if highlighted (as per user image style hint, or solid?) 
        // User image showed dotted line for parent connection. Let's make it distinct.
        // Actually user said "link connecting ... should be highlighted". 
        // I will use solid bold color for highlighting to be clear.
        opacity: isHighlighted ? 1 : 0.5,
        animation: isHighlighted ? 'dashdraw 0.5s linear infinite' : 'none', // Optional animation
      };
    };
    // Let's stick to simple bold color change
    const getSimpleEdgeStyle = (isHighlighted: boolean, defaultColor: string = 'hsl(var(--muted-foreground))') => ({
      stroke: isHighlighted ? 'hsl(var(--primary))' : defaultColor,
      strokeWidth: isHighlighted ? 3 : 1,
      opacity: isHighlighted ? 1 : 0.4,
    });


    // Center patient node
    nodesList.push({
      id: 'patient',
      position: { x: 0, y: 0 },
      data: { label: data.patientName },
      style: { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', fontWeight: 'bold', padding: 16, borderRadius: 50, border: 'none' },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    let currentY = 0;
    const conditionX = 350;
    const encounterX = 750;
    const medX = 1100;
    const nodeHeight = 60;
    const gap = 30;

    // Hierarchy: Patient -> Conditions -> Encounters (Dates) -> Medications
    data.conditions.forEach((c) => {
      const conditionEncounters = data.encounters.filter((e) => e.conditionId === c.id);

      const startY = currentY;
      const conditionNodeId = `condition-${c.id}`;

      // Determine if this condition branch is highlighted
      // Highlight if:
      // 1. This condition node is clicked
      // 2. Or the "patient" node is clicked (highlight everything?) - Let's stick to explicit condition click
      const isBranchHighlighted = highlightedNodeId === conditionNodeId;

      // Process Encounters Level
      conditionEncounters.forEach((e) => {
        const meds = data.medications.filter((m) => m.encounterId === e.id);

        // Calculate height for this branch
        const encounterBranchHeight = Math.max(1, meds.length) * (nodeHeight + gap);
        const encounterY = currentY + (encounterBranchHeight / 2) - (nodeHeight / 2);

        // Add Encounter Node (Date)
        const dateLabel = new Date(e.date).toLocaleDateString();
        nodesList.push({
          id: `enc-${e.id}`,
          position: { x: encounterX, y: encounterY },
          data: { label: `Date: ${dateLabel}` },
          style: {
            background: 'hsl(var(--secondary))',
            color: 'hsl(var(--secondary-foreground))',
            borderRadius: 8,
            border: '1px solid hsl(var(--border))',
            width: 160,
            fontSize: '12px'
          },
          targetPosition: Position.Left,
          sourcePosition: Position.Right,
        });

        // Link Condition -> Encounter
        // Highlight if the branch is highlighted
        edgesList.push({
          id: `e-cond-enc-${e.id}`,
          source: conditionNodeId,
          target: `enc-${e.id}`,
          type: 'smoothstep',
          style: getSimpleEdgeStyle(isBranchHighlighted)
        });

        // Add Medication Nodes
        meds.forEach((m, i) => {
          const medY = currentY + (i * (nodeHeight + gap));

          nodesList.push({
            id: `med-${m.id}`,
            position: { x: medX, y: medY },
            data: {
              label: `${m.name} (${m.dosage})`,
              prescribedDate: m.prescribedDate
            },
            style: {
              background: 'hsl(142 76% 36%)',
              color: 'white',
              borderRadius: 8,
              border: 'none',
              fontSize: '11px',
              width: 180
            },
            targetPosition: Position.Left,
          });

          // Link Encounter -> Medication
          // Highlight if branch is highlighted
          edgesList.push({
            id: `e-enc-med-${m.id}`,
            source: `enc-${e.id}`,
            target: `med-${m.id}`,
            type: 'smoothstep',
            style: getSimpleEdgeStyle(isBranchHighlighted)
          });
        });

        currentY += encounterBranchHeight + gap;
      });

      // Handle no encounters safely
      if (conditionEncounters.length === 0) {
        currentY += nodeHeight + gap;
      }

      // Center Condition Node
      const conditionBlockHeight = currentY - startY - gap;
      const conditionY = startY + (conditionBlockHeight / 2);

      // Add Condition Node
      nodesList.push({
        id: conditionNodeId,
        position: { x: conditionX, y: Math.max(startY, conditionY) },
        data: { label: c.name },
        style: {
          background: c.severity === 'high' ? 'hsl(var(--destructive))' : 'hsl(var(--muted))',
          color: c.severity === 'high' ? 'white' : 'inherit',
          borderRadius: 8,
          border: '1px solid hsl(var(--border))',
          width: 250,
          fontWeight: 'bold',
          // Visual feedback if selected
          boxShadow: isBranchHighlighted ? '0 0 0 2px hsl(var(--primary))' : 'none',
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });

      // Link Patient -> Condition
      edgesList.push({
        id: `e-pat-cond-${c.id}`,
        source: 'patient',
        target: conditionNodeId,
        animated: true,
        style: getSimpleEdgeStyle(isBranchHighlighted)
      });

      currentY += gap; // Gap between conditions
    });

    // Alerts (Left side)
    data.alerts.forEach((a, i) => {
      const alertNodeId = `alert-${a.id}`;
      const isHighlighted = highlightedNodeId === alertNodeId;

      nodesList.push({
        id: alertNodeId,
        position: { x: -300, y: i * 100 },
        data: { label: `⚠️ ${a.message}` },
        style: {
          background: 'hsl(var(--destructive))',
          color: 'white',
          borderRadius: 8,
          border: 'none',
          boxShadow: isHighlighted ? '0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--destructive))' : 'none',
        },
        sourcePosition: Position.Right,
      });
      edgesList.push({
        id: `e-a-${a.id}`,
        source: alertNodeId,
        target: 'patient',
        animated: true,
        style: {
          stroke: 'hsl(var(--destructive))',
          strokeWidth: isHighlighted ? 3 : 1.5,
          opacity: 1,
        }
      });
    });

    return { nodes: nodesList, edges: edgesList };
  }, [data, highlightedNodeId]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Set highlighted node
    setHighlightedNodeId(node.id);

    // Show toast for Meds
    if (node.id.startsWith('med-')) {
      const dateStr = node.data.prescribedDate;
      if (dateStr) {
        const date = new Date(dateStr).toLocaleDateString();
        toast({
          title: "Medication Info",
          description: `Prescribed Date: ${date}`,
          duration: 3000,
        });
      }
    }
  }, [toast]);

  // Keep background click clear selection
  const onPaneClick = useCallback(() => {
    setHighlightedNodeId(null);
  }, []);

  if (isLoading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />AI Mind Map</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(true)} title="Maximize">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full rounded-lg border bg-muted/20">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>AI Mind Map - Fullscreen</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 border rounded-lg bg-muted/20">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
