import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TrazaRazonamiento } from '@/components/TrazaRazonamiento';
import type { EvaluacionRequest, EvaluacionResponse } from '@/types/api';

vi.mock('@/components/ArbolInferencia', () => ({
  default: ({
    data,
    request,
    className,
  }: {
    data: EvaluacionResponse;
    request: EvaluacionRequest;
    className?: string;
  }) => (
    <div data-testid="arbol-inferencia-mock" className={className}>
      <span>Árbol Mock: {data.id_comunidad}</span>
      <span>Radiación: {request.radiacion}</span>
      {data.recomendaciones.map((r) => (
        <span key={r.regla_origen}>Disparó {r.regla_origen}</span>
      ))}
    </div>
  ),
  ArbolInferencia: ({
    data,
    request,
    className,
  }: {
    data: EvaluacionResponse;
    request: EvaluacionRequest;
    className?: string;
  }) => (
    <div data-testid="arbol-inferencia-mock" className={className}>
      <span>Árbol Mock: {data.id_comunidad}</span>
      <span>Radiación: {request.radiacion}</span>
      {data.recomendaciones.map((r) => (
        <span key={r.regla_origen}>Disparó {r.regla_origen}</span>
      ))}
    </div>
  ),
}));

const MOCK_REQUEST: EvaluacionRequest = {
  id_comunidad: 'Comunidad-Andina-Test',
  radiacion: 4.8, // R02 (Media)
  velocidad_viento: 1.5, // R06 (Inviable)
  hay_curso_agua: 'si',
  caudal: 75.0,
  salto_neto: 14.0, // R08 (Media)
  masa_estiercol: 6.0, // R12 (Media)
  consumo_diario: 4200.0, // R16 (Alto Productivo)
  presupuesto: 'medio',
};

const MOCK_RESPONSE: EvaluacionResponse = {
  id_comunidad: 'Comunidad-Andina-Test',
  recomendaciones: [
    {
      tecnologia: 'Sistema Híbrido Solar-Hidráulico',
      justificacion: 'Recursos solar e hidráulico viables combinados con demanda productiva.',
      regla_origen: 'R28',
    },
  ],
  viabilidades: {
    solar: 'media',
    eolico: 'inviable',
    hidraulico: 'media',
    biomasa: 'media',
  },
  demanda_clasificada: 'alto_productivo',
};

describe('TrazaRazonamiento', () => {
  it('no renderiza nada si request no está disponible', () => {
    const { container } = render(<TrazaRazonamiento data={MOCK_RESPONSE} request={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza el árbol interactivo por defecto y botón de pantalla completa', () => {
    render(<TrazaRazonamiento data={MOCK_RESPONSE} request={MOCK_REQUEST} />);

    expect(screen.getByText('Cadena de Inferencia del Sistema Experto')).toBeInTheDocument();
    expect(screen.getByText('XAI')).toBeInTheDocument();
    expect(screen.getByText('Árbol Interactivo')).toBeInTheDocument();
    expect(screen.getByText('Secuencia (Tabla)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ampliar/i })).toBeInTheDocument();
  });

  it('permite alternar a la tabla de secuencia paso a paso (i, Regla, Acción, Resultado)', async () => {
    const user = userEvent.setup();
    render(<TrazaRazonamiento data={MOCK_RESPONSE} request={MOCK_REQUEST} />);

    // Cambiar a vista de secuencia (tabla)
    const botonSecuencia = screen.getByRole('button', { name: /secuencia \(tabla\)/i });
    await user.click(botonSecuencia);

    // Cabeceras de la tabla
    expect(screen.getByRole('columnheader', { name: 'N' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Regla' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Acción' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Resultado' })).toBeInTheDocument();

    // Filas esperadas
    expect(screen.getByText('R02')).toBeInTheDocument();
    expect(screen.getByText(/viabilidad solar = media/i)).toBeInTheDocument();

    expect(screen.getByText('R06')).toBeInTheDocument();
    expect(screen.getByText(/viabilidad eólica = inviable/i)).toBeInTheDocument();

    expect(screen.getByText('R08')).toBeInTheDocument();
    expect(screen.getByText(/viabilidad hidráulica = media/i)).toBeInTheDocument();

    expect(screen.getByText('R12')).toBeInTheDocument();
    expect(screen.getByText(/viabilidad biomasa = media/i)).toBeInTheDocument();

    expect(screen.getByText('R16')).toBeInTheDocument();
    expect(screen.getByText(/demanda = productiva/i)).toBeInTheDocument();

    // Capa 2
    expect(screen.getByText('R28')).toBeInTheDocument();
    expect(screen.getByText('Sistema Híbrido Solar-Hidráulico')).toBeInTheDocument();
  });

  it('permite alternar a pantalla completa y restaurar', async () => {
    const user = userEvent.setup();
    render(<TrazaRazonamiento data={MOCK_RESPONSE} request={MOCK_REQUEST} />);

    const botonAmpliar = screen.getByRole('button', { name: /ampliar/i });
    await user.click(botonAmpliar);

    expect(screen.getByRole('button', { name: /restaurar/i })).toBeInTheDocument();

    const botonRestaurar = screen.getByRole('button', { name: /restaurar/i });
    await user.click(botonRestaurar);

    expect(screen.getByRole('button', { name: /ampliar/i })).toBeInTheDocument();
  });

  it('permite colapsar y expandir la traza mediante el botón', async () => {
    const user = userEvent.setup();
    render(<TrazaRazonamiento data={MOCK_RESPONSE} request={MOCK_REQUEST} />);

    const boton = screen.getByRole('button', { name: /ocultar/i });
    expect(boton).toHaveAttribute('aria-expanded', 'true');

    await user.click(boton);
    expect(boton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: /ver/i })).toBeInTheDocument();

    // El contenido se oculta
    expect(screen.queryByText(/💡 Pista: Haz clic y arrastra cualquier nodo/i)).not.toBeInTheDocument();

    await user.click(boton);
    expect(screen.getByText(/💡 Pista: Haz clic y arrastra cualquier nodo/i)).toBeInTheDocument();
  });
});
