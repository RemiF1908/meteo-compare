import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ModelDialog, ModelRail } from './ModelPicker'

describe('ModelPicker', () => {
  it('affiche les modèles sélectionnés dans le rail', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    render(
      <ModelRail
        selected={['ecmwf_ifs']}
        statuses={{ ecmwf_ifs: 'ok' }}
        runs={{
          ecmwf_ifs: {
            initialisationTime: Date.UTC(2026, 10, 10, 12, 0, 0) / 1000,
            availabilityTime: null,
          },
        }}
        loading={false}
        onRemove={onRemove}
        onOpen={vi.fn()}
      />,
    )

    expect(screen.getByText('ECMWF IFS HRES 9 km')).toBeInTheDocument()
    expect(
      screen.getByText(/Dernière sortie .*12:00 UTC/),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: /Retirer ECMWF IFS HRES 9 km/ }),
    )
    expect(onRemove).toHaveBeenCalledWith('ecmwf_ifs')
  })

  it('ajoute un modèle via la modale et applique la sélection', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <ModelDialog
        open
        onClose={vi.fn()}
        selected={['ecmwf_ifs']}
        onChange={onChange}
        statuses={{ ecmwf_ifs: 'ok' }}
        countryCode="FR"
      />,
    )

    const gfs = screen.getByRole('checkbox', { name: /NCEP GFS Seamless/ })
    expect(gfs).not.toBeChecked()
    await user.click(gfs)
    await user.click(screen.getByRole('button', { name: 'Appliquer' }))

    expect(onChange).toHaveBeenCalledWith([
      'ecmwf_ifs',
      'ncep_gfs_seamless',
    ])
  })

  it('filtre les modèles dans la modale', async () => {
    const user = userEvent.setup()

    render(
      <ModelDialog
        open
        onClose={vi.fn()}
        selected={[]}
        onChange={vi.fn()}
        statuses={{}}
      />,
    )

    await user.type(
      screen.getByLabelText('Rechercher un modèle'),
      'arome',
    )

    expect(
      screen.getByText('Météo-France AROME France HD'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('ECMWF IFS HRES 9 km'),
    ).not.toBeInTheDocument()
  })
})
