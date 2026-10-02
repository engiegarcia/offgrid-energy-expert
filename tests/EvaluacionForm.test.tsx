import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EvaluacionForm } from '@/components/EvaluacionForm';
import { EJEMPLO_SAN_MARCOS } from '@/lib/constants';

/** Escribe en un campo numérico o de texto ya limpio. */
async function completarValido(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nombre o código'), 'San-Marcos-Test');
  await user.type(screen.getByLabelText('Radiación solar'), '4.8');
  await user.type(screen.getByLabelText('Velocidad del viento'), '1.5');
  await user.selectOptions(screen.getByLabelText('¿Hay curso de agua?'), 'si');
  await user.type(screen.getByLabelText('Caudal'), '75');
  await user.type(screen.getByLabelText('Salto neto'), '14');
  await user.type(screen.getByLabelText('Estiércol disponible'), '6');
  await user.type(screen.getByLabelText('Consumo diario'), '4200');
  await user.selectOptions(screen.getByLabelText('Presupuesto'), 'medio');
}

describe('EvaluacionForm', () => {
  it('renderiza todos los campos con su label asociado', () => {
    render(<EvaluacionForm onSubmit={vi.fn()} isPending={false} />);
    for (const label of [
      'Nombre o código',
      'Radiación solar',
      'Velocidad del viento',
      '¿Hay curso de agua?',
      'Caudal',
      'Salto neto',
      'Estiércol disponible',
      'Consumo diario',
      'Presupuesto',
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Evaluar zona' })).toBeEnabled();
  });

  it('muestra las unidades como parte de la descripción accesible del campo', () => {
    render(<EvaluacionForm onSubmit={vi.fn()} isPending={false} />);
    expect(screen.getByLabelText('Radiación solar')).toHaveAccessibleDescription(/kWh\/m²\/día/);
    expect(screen.getByLabelText('Caudal')).toHaveAccessibleDescription(/l\/s/);
  });

  it('al enviar vacío muestra errores accesibles y no llama a onSubmit', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EvaluacionForm onSubmit={onSubmit} isPending={false} />);

    await user.click(screen.getByRole('button', { name: 'Evaluar zona' }));

    const alertas = await screen.findAllByRole('alert');
    expect(alertas.length).toBeGreaterThanOrEqual(6);
    expect(onSubmit).not.toHaveBeenCalled();

    const radiacion = screen.getByLabelText('Radiación solar');
    expect(radiacion).toHaveAttribute('aria-invalid', 'true');
    expect(radiacion).toHaveAccessibleDescription(/obligatoria?/i);
    expect(screen.getByLabelText('Nombre o código')).toHaveAccessibleDescription(
      'Cómo identificas a la comunidad. Máximo 100 caracteres. El nombre de la comunidad es obligatorio',
    );
  });

  it('muestra un mensaje de rango cuando el valor está fuera de límites', async () => {
    const user = userEvent.setup();
    render(<EvaluacionForm onSubmit={vi.fn()} isPending={false} />);

    await user.type(screen.getByLabelText('Radiación solar'), '11');
    await user.click(screen.getByRole('button', { name: 'Evaluar zona' }));

    expect(await screen.findByText(/como máximo 10 kWh/)).toBeInTheDocument();
  });

  it('envía el payload correcto con datos válidos (números, no strings)', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EvaluacionForm onSubmit={onSubmit} isPending={false} />);

    await completarValido(user);
    await user.click(screen.getByRole('button', { name: 'Evaluar zona' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(EJEMPLO_SAN_MARCOS);
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('con "No" hay curso de agua deshabilita caudal y salto y los envía como 0', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EvaluacionForm onSubmit={onSubmit} isPending={false} />);

    await user.click(screen.getByRole('button', { name: 'Usar ejemplo' }));
    await user.selectOptions(screen.getByLabelText('¿Hay curso de agua?'), 'no');

    const caudal = screen.getByLabelText('Caudal');
    const salto = screen.getByLabelText('Salto neto');
    expect(caudal).toBeDisabled();
    expect(salto).toBeDisabled();
    expect(caudal).toHaveValue(0);
    expect(salto).toHaveValue(0);

    await user.click(screen.getByRole('button', { name: 'Evaluar zona' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      ...EJEMPLO_SAN_MARCOS,
      hay_curso_agua: 'no',
      caudal: 0,
      salto_neto: 0,
    });
  });

  it('al volver a "Sí" reactiva los campos y los vacía', async () => {
    const user = userEvent.setup();
    render(<EvaluacionForm onSubmit={vi.fn()} isPending={false} />);

    const select = screen.getByLabelText('¿Hay curso de agua?');
    await user.selectOptions(select, 'no');
    await user.selectOptions(select, 'si');

    expect(screen.getByLabelText('Caudal')).toBeEnabled();
    expect(screen.getByLabelText('Caudal')).toHaveValue(null);
  });

  it('"Usar ejemplo" completa el formulario', async () => {
    const user = userEvent.setup();
    render(<EvaluacionForm onSubmit={vi.fn()} isPending={false} />);
    await user.click(screen.getByRole('button', { name: 'Usar ejemplo' }));
    expect(screen.getByLabelText('Nombre o código')).toHaveValue('San-Marcos-Test');
    expect(screen.getByLabelText('Caudal')).toHaveValue(75);
    expect(screen.getByLabelText('Presupuesto')).toHaveValue('medio');
  });

  it('permite seleccionar otros casos de ejemplo desde el menú desplegable', async () => {
    const user = userEvent.setup();
    render(<EvaluacionForm onSubmit={vi.fn()} isPending={false} />);

    await user.click(screen.getByRole('button', { name: 'Seleccionar caso de ejemplo' }));
    expect(screen.getByRole('menu', { name: 'Casos de ejemplo' })).toBeInTheDocument();

    await user.click(screen.getByText('Puno - Alta Solar'));
    expect(screen.getByLabelText('Nombre o código')).toHaveValue('Puno-Alta-Solar');
    expect(screen.getByLabelText('Radiación solar')).toHaveValue(6.1);
    expect(screen.getByLabelText('Caudal')).toBeDisabled();
    expect(screen.getByLabelText('Presupuesto')).toHaveValue('bajo');

    await user.click(screen.getByRole('button', { name: 'Seleccionar caso de ejemplo' }));
    await user.click(screen.getByText('Ayacucho - Biomasa'));
    expect(screen.getByLabelText('Nombre o código')).toHaveValue('Ayacucho-Biomasa');
    expect(screen.getByLabelText('Estiércol disponible')).toHaveValue(18);
    expect(screen.getByLabelText('Consumo diario')).toHaveValue(2500);
    expect(screen.getByLabelText('Presupuesto')).toHaveValue('medio');

    await user.click(screen.getByRole('button', { name: 'Seleccionar caso de ejemplo' }));
    await user.click(screen.getByText('Sin Recursos'));
    expect(screen.getByLabelText('Nombre o código')).toHaveValue('Sin-Recursos');
    expect(screen.getByLabelText('Radiación solar')).toHaveValue(1);
    expect(screen.getByLabelText('Presupuesto')).toHaveValue('bajo');
  });

  it('muestra los errores 422 del backend junto al campo', async () => {
    render(
      <EvaluacionForm
        onSubmit={vi.fn()}
        isPending={false}
        serverErrors={{ radiacion: 'Input should be less than or equal to 10' }}
      />,
    );
    const radiacion = screen.getByLabelText('Radiación solar');
    expect(await screen.findByText('Input should be less than or equal to 10')).toBeInTheDocument();
    expect(radiacion).toHaveAttribute('aria-invalid', 'true');
  });

  it('con isPending bloquea el botón y lo marca como ocupado', () => {
    render(<EvaluacionForm onSubmit={vi.fn()} isPending />);
    const boton = screen.getByRole('button', { name: 'Evaluando…' });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAttribute('aria-busy', 'true');
  });
});
