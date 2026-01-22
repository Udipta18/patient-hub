import { useCallback, useMemo } from 'react';
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
import { Brain } from 'lucide-react';

interface PatientMindMapProps {
  patientId: string;
}

export function PatientMindMap({ patientId }: PatientMindMapProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['patient', patientId, 'mindmap'],
    queryFn: () => patientService.getPatientMindMap(patientId),
  });

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    const nodesList: Node[] = [];
    const edgesList: Edge[] = [];

    // Center patient node
    nodesList.push({
      id: 'patient',
      position: { x: 300, y: 200 },
      data: { label: data.patientName },
      style: { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', fontWeight: 'bold', padding: 16, borderRadius: 50 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    // Conditions
    data.conditions.forEach((c, i) => {
      nodesList.push({
        id: `condition-${c.id}`,
        position: { x: 550, y: 50 + i * 80 },
        data: { label: c.name },
        style: { background: c.severity === 'high' ? 'hsl(var(--destructive))' : 'hsl(var(--muted))', color: c.severity === 'high' ? 'white' : 'inherit', borderRadius: 8 },
      });
      edgesList.push({ id: `e-c-${c.id}`, source: 'patient', target: `condition-${c.id}`, animated: true });
    });

    // Medications
    data.medications.forEach((m, i) => {
      nodesList.push({
        id: `med-${m.id}`,
        position: { x: 550, y: 300 + i * 70 },
        data: { label: `${m.name}` },
        style: { background: 'hsl(142 76% 36%)', color: 'white', borderRadius: 8 },
      });
      edgesList.push({ id: `e-m-${m.id}`, source: 'patient', target: `med-${m.id}` });
    });

    // Alerts
    data.alerts.forEach((a, i) => {
      nodesList.push({
        id: `alert-${a.id}`,
        position: { x: 50, y: 100 + i * 80 },
        data: { label: `⚠️ ${a.message}` },
        style: { background: 'hsl(var(--destructive))', color: 'white', borderRadius: 8 },
      });
      edgesList.push({ id: `e-a-${a.id}`, source: `alert-${a.id}`, target: 'patient' });
    });

    return { nodes: nodesList, edges: edgesList };
  }, [data]);

  if (isLoading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />AI Mind Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full rounded-lg border bg-muted/20">
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
}
