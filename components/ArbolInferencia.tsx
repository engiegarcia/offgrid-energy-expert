'use client';

import React, { useCallback, useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  IconBolt,
  IconDrop,
  IconLeaf,
  IconSun,
  IconWind,
  iconoDeTecnologia,
} from '@/components/icons';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { DEMANDA_INFO, NIVEL_LABEL, RECURSO_LABEL } from '@/lib/constants';
import { deducirCapa1 } from '@/lib/explicabilidad';
import type { EvaluacionRequest, EvaluacionResponse, NivelViabilidad, Recurso } from '@/types/api';

/* =========================================================================
   NODOS PERSONALIZADOS (Arrastrables e interactivos)
   ========================================================================= */

interface EntradaNodeData extends Record<string, unknown> {
  categoria: string;
  titulo: string;
  valor: string;
  Icono: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

function NodoEntrada({ data }: NodeProps<Node<EntradaNodeData>>) {
  const Icono = data.Icono;
  return (
    <div className="group relative w-48 rounded-xl border border-line bg-surface p-2.5 shadow-sm transition-all hover:border-accent hover:shadow-md">
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-2 !border-surface !bg-accent"
      />
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ground text-ink-muted">
          <Icono className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
            {data.categoria}
          </p>
          <p className="truncate text-xs font-semibold text-ink">{data.titulo}</p>
        </div>
      </div>
      <div className="mt-1.5 border-t border-line/60 pt-1 font-mono text-xs font-semibold text-accent">
        {data.valor}
      </div>
    </div>
  );
}

interface Capa1NodeData extends Record<string, unknown> {
  recurso: string;
  regla: string;
  condicion: string;
  nivel: NivelViabilidad | string;
  esDemanda?: boolean;
  Icono: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

function NodoCapa1({ data }: NodeProps<Node<Capa1NodeData>>) {
  const Icono = data.Icono;
  return (
    <div className="group relative w-56 rounded-xl border border-line bg-surface p-2.5 shadow-sm transition-all hover:border-accent hover:shadow-md">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-2 !border-surface !bg-accent"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-2 !border-surface !bg-accent"
      />
      <div className="flex items-center justify-between gap-1.5 pb-1">
        <span className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-accent">
          {data.regla}
        </span>
        {data.esDemanda ? (
          <Badge tone="accent">{data.nivel}</Badge>
        ) : (
          <Badge tone={data.nivel as NivelViabilidad} dot>
            {NIVEL_LABEL[data.nivel as NivelViabilidad] ?? data.nivel}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1.5 pt-0.5">
        <Icono className="h-3.5 w-3.5 text-ink-muted" />
        <span className="text-xs font-semibold text-ink">{data.recurso}</span>
      </div>

      <div
        className="mt-1.5 truncate border-t border-line/60 pt-1 font-mono text-[10px] text-ink-subtle"
        title={data.condicion}
      >
        {data.condicion}
      </div>
    </div>
  );
}

interface RecomendacionNodeData extends Record<string, unknown> {
  tecnologia: string;
  regla: string;
  justificacion: string;
}

function NodoRecomendacion({ data }: NodeProps<Node<RecomendacionNodeData>>) {
  const Icono = iconoDeTecnologia(data.tecnologia);
  return (
    <div className="group relative w-64 rounded-xl border-2 border-accent bg-accent-soft/40 p-3 shadow-md transition-all hover:shadow-lg">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-surface !bg-accent"
      />
      <div className="flex items-center justify-between gap-1 pb-1">
        <span className="rounded bg-accent px-2 py-0.5 font-mono text-xs font-bold text-white">
          Disparó {data.regla}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
          Prescripción
        </span>
      </div>

      <div className="mt-1 flex items-start gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-night text-sun">
          <Icono className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-xs font-bold leading-tight text-ink">
            {data.tecnologia}
          </h4>
        </div>
      </div>

      <p className="mt-2 line-clamp-3 text-[11px] text-ink-muted">{data.justificacion}</p>
    </div>
  );
}

const NODE_TYPES = {
  nodoEntrada: NodoEntrada,
  nodoCapa1: NodoCapa1,
  nodoRecomendacion: NodoRecomendacion,
};

/* =========================================================================
   COMPONENTE PRINCIPAL DEL ÁRBOL
   ========================================================================= */

interface ArbolInferenciaProps {
  data: EvaluacionResponse;
  request: EvaluacionRequest;
  className?: string;
}

export function ArbolInferencia({ data, request, className }: ArbolInferenciaProps) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const { recursos, demanda } = deducirCapa1(request);
    const infoDemanda = DEMANDA_INFO[demanda.nivel];

    const ICONOS_REC: Record<Recurso, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
      solar: IconSun,
      eolico: IconWind,
      hidraulico: IconDrop,
      biomasa: IconLeaf,
    };

    // 1. Nodos de Entrada (Columna X = 20)
    const nodes: Node[] = [
      {
        id: 'in-solar',
        type: 'nodoEntrada',
        position: { x: 20, y: 20 },
        data: {
          categoria: 'Medición',
          titulo: 'Radiación Solar',
          valor: `${request.radiacion} kWh/m²/día`,
          Icono: IconSun,
        },
      },
      {
        id: 'in-viento',
        type: 'nodoEntrada',
        position: { x: 20, y: 110 },
        data: {
          categoria: 'Medición',
          titulo: 'Velocidad Viento',
          valor: `${request.velocidad_viento} m/s`,
          Icono: IconWind,
        },
      },
      {
        id: 'in-agua',
        type: 'nodoEntrada',
        position: { x: 20, y: 200 },
        data: {
          categoria: 'Medición',
          titulo: 'Hidrología',
          valor:
            request.hay_curso_agua === 'si'
              ? `Q=${request.caudal} l/s · H=${request.salto_neto} m`
              : 'Sin curso de agua',
          Icono: IconDrop,
        },
      },
      {
        id: 'in-estiercol',
        type: 'nodoEntrada',
        position: { x: 20, y: 290 },
        data: {
          categoria: 'Medición',
          titulo: 'Masa Estiércol',
          valor: `${request.masa_estiercol} kg/día`,
          Icono: IconLeaf,
        },
      },
      {
        id: 'in-consumo',
        type: 'nodoEntrada',
        position: { x: 20, y: 380 },
        data: {
          categoria: 'Demanda',
          titulo: 'Consumo Diario',
          valor: `${request.consumo_diario.toLocaleString('es-PE')} Wh/día`,
          Icono: IconBolt,
        },
      },
      {
        id: 'in-presupuesto',
        type: 'nodoEntrada',
        position: { x: 20, y: 470 },
        data: {
          categoria: 'Finanzas',
          titulo: 'Presupuesto',
          valor: request.presupuesto.toUpperCase(),
          Icono: IconBolt,
        },
      },
    ];

    // 2. Nodos Capa 1: Deducciones Intermedias (Columna X = 290)
    recursos.forEach((r, idx) => {
      nodes.push({
        id: `capa1-${r.recurso}`,
        type: 'nodoCapa1',
        position: { x: 290, y: 20 + idx * 90 },
        data: {
          recurso: RECURSO_LABEL[r.recurso],
          regla: r.regla,
          condicion: r.condicion,
          nivel: r.nivel,
          Icono: ICONOS_REC[r.recurso],
        },
      });
    });

    nodes.push({
      id: 'capa1-demanda',
      type: 'nodoCapa1',
      position: { x: 290, y: 20 + 4 * 90 },
      data: {
        recurso: 'Demanda MTF',
        regla: demanda.regla,
        condicion: demanda.condicion,
        nivel: infoDemanda.label,
        esDemanda: true,
        Icono: IconBolt,
      },
    });

    // 3. Nodos Capa 2: Decisiones Tecnológicas (Columna X = 620)
    const totalRecs = data.recomendaciones.length;
    if (totalRecs > 0) {
      data.recomendaciones.forEach((rec, idx) => {
        nodes.push({
          id: `rec-${idx}`,
          type: 'nodoRecomendacion',
          position: { x: 620, y: 40 + idx * 140 },
          data: {
            tecnologia: rec.tecnologia,
            regla: rec.regla_origen,
            justificacion: rec.justificacion,
          },
        });
      });
    } else {
      nodes.push({
        id: 'rec-inviable',
        type: 'nodoCapa1',
        position: { x: 620, y: 200 },
        data: {
          recurso: 'Sin Solución Viable',
          regla: 'R17–R30',
          condicion: 'Restricciones de recurso o costo no satisfechas',
          nivel: 'inviable',
          Icono: IconBolt,
        },
      });
    }

    // 4. Aristas / Conectores
    const edges: Edge[] = [
      {
        id: 'e-in-solar-capa1',
        source: 'in-solar',
        target: 'capa1-solar',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#17565F', strokeWidth: 1.5 },
      },
      {
        id: 'e-in-viento-capa1',
        source: 'in-viento',
        target: 'capa1-eolico',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#17565F', strokeWidth: 1.5 },
      },
      {
        id: 'e-in-agua-capa1',
        source: 'in-agua',
        target: 'capa1-hidraulico',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#17565F', strokeWidth: 1.5 },
      },
      {
        id: 'e-in-estiercol-capa1',
        source: 'in-estiercol',
        target: 'capa1-biomasa',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#17565F', strokeWidth: 1.5 },
      },
      {
        id: 'e-in-consumo-capa1',
        source: 'in-consumo',
        target: 'capa1-demanda',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#17565F', strokeWidth: 1.5 },
      },
    ];

    // Conectar Capa 1 y Presupuesto hacia las recomendaciones
    if (totalRecs > 0) {
      data.recomendaciones.forEach((rec, idx) => {
        const targetId = `rec-${idx}`;
        const nombreTec = rec.tecnologia.toLowerCase();

        if (/solar|shs|fotovolt/.test(nombreTec)) {
          edges.push({
            id: `e-solar-${targetId}`,
            source: 'capa1-solar',
            target: targetId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#2E8B57', strokeWidth: 2 },
          });
        }
        if (/eolic|aerogen|viento/.test(nombreTec)) {
          edges.push({
            id: `e-eolico-${targetId}`,
            source: 'capa1-eolico',
            target: targetId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#2E8B57', strokeWidth: 2 },
          });
        }
        if (/hidraul|hidro|turbina|banki|pelton/.test(nombreTec)) {
          edges.push({
            id: `e-hidro-${targetId}`,
            source: 'capa1-hidraulico',
            target: targetId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#2E8B57', strokeWidth: 2 },
          });
        }
        if (/biodig|biogas|biomasa/.test(nombreTec)) {
          edges.push({
            id: `e-biomasa-${targetId}`,
            source: 'capa1-biomasa',
            target: targetId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#2E8B57', strokeWidth: 2 },
          });
        }

        // Siempre vincular demanda y presupuesto
        edges.push({
          id: `e-demanda-${targetId}`,
          source: 'capa1-demanda',
          target: targetId,
          type: 'smoothstep',
          style: { stroke: '#17565F', strokeWidth: 1.5, strokeDasharray: '4 4' },
        });

        edges.push({
          id: `e-presupuesto-${targetId}`,
          source: 'in-presupuesto',
          target: targetId,
          type: 'smoothstep',
          style: { stroke: '#BCC7C3', strokeWidth: 1.5, strokeDasharray: '4 4' },
        });
      });
    } else {
      edges.push({
        id: 'e-inviable',
        source: 'capa1-demanda',
        target: 'rec-inviable',
        type: 'smoothstep',
        style: { stroke: '#C8483E', strokeWidth: 1.5 },
      });
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [data, request]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-xl border border-line bg-surface/50',
        className ?? 'h-[560px]',
      )}
    >
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg border border-line/80 bg-surface/90 px-3 py-1.5 text-xs text-ink shadow-sm backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
        <span className="font-medium">
          Árbol Interactivo: puedes <strong>arrastrar los nodos</strong>, hacer <strong>zoom</strong> y navegar el lienzo
        </span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.4}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#BCC7C3" />
        <Controls className="!border-line !bg-surface !shadow-md" />
        <MiniMap
          nodeColor="#17565F"
          maskColor="rgba(237, 240, 236, 0.7)"
          className="!bottom-3 !right-3 !rounded-lg !border !border-line !shadow-sm"
        />
      </ReactFlow>
    </div>
  );
}
export default ArbolInferencia;
