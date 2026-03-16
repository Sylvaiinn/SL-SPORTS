export type SwimStyle = 'Endurance' | 'Vitesse' | 'Technique' | 'Mixte'
export type SwimDistance = 1000 | 1500 | 2500 | 3500
export type SwimLevel = 'Débutant' | 'Intermédiaire' | 'Avancé'
export type SwimEquipment = 'palmes' | 'pull-buoy' | 'planche'

export interface SwimBlock {
  label: string
  type: 'warmup' | 'main' | 'cooldown' | 'rest'
  distance: number
  description: string
  pace?: string
  restSeconds?: number
  equipment?: SwimEquipment[]
}

export interface SwimPlan {
  style: SwimStyle
  level: SwimLevel
  equipment: SwimEquipment[]
  restSeconds: number
  totalDistance: number
  warmup: SwimBlock[]
  main: SwimBlock[]
  cooldown: SwimBlock[]
}

export interface SwimGeneratorParams {
  style: SwimStyle
  distance: number            // meters, free value
  level?: SwimLevel
  equipment?: SwimEquipment[]
  restSeconds?: number
}

function round50(n: number): number {
  return Math.max(50, Math.round(n / 50) * 50)
}

/** Adjusts pace label based on level */
function scalePace(base: string, level: SwimLevel): string {
  if (level === 'Débutant') {
    return base.replace(/RPE (\d+)-?(\d+)?\/10/g, (_, a, b) => {
      const lo = Math.max(1, parseInt(a) - 2)
      const hi = b ? Math.max(1, parseInt(b) - 2) : lo + 1
      return `RPE ${lo}-${hi}/10`
    })
  }
  if (level === 'Avancé') {
    return base.replace(/RPE (\d+)-?(\d+)?\/10/g, (_, a, b) => {
      const lo = Math.min(10, parseInt(a) + 1)
      const hi = b ? Math.min(10, parseInt(b) + 1) : lo + 1
      return `RPE ${lo}-${hi}/10`
    })
  }
  return base
}

/** Adds equipment note to a block's description */
function withEquipment(desc: string, equip: SwimEquipment[], suggest: SwimEquipment[]): string {
  const active = suggest.filter(e => equip.includes(e))
  if (active.length === 0) return desc
  const labels: Record<SwimEquipment, string> = {
    palmes: '🦈 Palmes', 'pull-buoy': '🟡 Pull-buoy', planche: '🏄 Planche',
  }
  return `${desc} | Équipement : ${active.map(e => labels[e]).join(', ')}`
}

/** Level-specific warmup descriptions */
function levelWarmupNote(level: SwimLevel): string {
  if (level === 'Débutant') return ' Prenez votre temps, pas de chrono.'
  if (level === 'Avancé') return ' Incluez 4×25m accélérations progressives.'
  return ''
}

export function generateSwimSession(params: SwimGeneratorParams): SwimPlan {
  const {
    style,
    distance,
    level = 'Intermédiaire',
    equipment = [],
    restSeconds = 30,
  } = params

  const restLabel = restSeconds > 0 ? ` | Repos : ${restSeconds}s entre les séries` : ''
  const warmupDist = round50(distance * 0.18)
  const cooldownDist = round50(distance * 0.12)
  const mainDist = distance - warmupDist - cooldownDist

  const warmup: SwimBlock[] = [
    {
      label: 'Échauffement libre',
      type: 'warmup',
      distance: round50(warmupDist * 0.5),
      description: withEquipment(
        `Crawl tranquille, focus respiration.${levelWarmupNote(level)}`,
        equipment, []
      ),
      pace: scalePace('RPE 3/10', level),
      restSeconds,
    },
    {
      label: 'Travail de bras',
      type: 'warmup',
      distance: round50(warmupDist * 0.3),
      description: withEquipment(
        'Bras uniquement, dos crawl alternés.',
        equipment, ['pull-buoy']
      ),
      pace: scalePace('RPE 4/10', level),
      equipment: ['pull-buoy'],
      restSeconds,
    },
    {
      label: 'Travail de jambes',
      type: 'warmup',
      distance: round50(warmupDist * 0.2),
      description: withEquipment(
        'Jambes uniquement, crawl puis dos.',
        equipment, ['planche', 'palmes']
      ),
      pace: scalePace('RPE 4/10', level),
      equipment: ['planche', 'palmes'],
      restSeconds,
    },
  ]

  let main: SwimBlock[] = []

  if (style === 'Endurance') {
    const seg = round50(mainDist / 3)
    const r = round50(seg * 0.2)
    const distLabel = level === 'Débutant' ? 'en fractionnant si besoin' : 'en continu'
    main = [
      {
        label: 'Série longue 1',
        type: 'main',
        distance: seg,
        description: withEquipment(`${seg}m crawl ${distLabel}. Rythme régulier, expiration lente.${restLabel}`, equipment, ['palmes']),
        pace: scalePace('RPE 5-6/10', level),
        restSeconds,
      },
      {
        label: 'Récupération active',
        type: 'rest',
        distance: r,
        description: 'Dos crawl tranquille, bras le long du corps.',
        pace: scalePace('RPE 2/10', level),
        restSeconds,
      },
      {
        label: 'Série longue 2',
        type: 'main',
        distance: seg,
        description: withEquipment(`${seg}m crawl. Augmentez légèrement les 100 derniers mètres.${restLabel}`, equipment, ['palmes']),
        pace: scalePace('RPE 6-7/10', level),
        restSeconds,
      },
      {
        label: 'Récupération active',
        type: 'rest',
        distance: r,
        description: 'Dos crawl, respirations profondes.',
        pace: scalePace('RPE 2/10', level),
        restSeconds,
      },
      {
        label: 'Série finale',
        type: 'main',
        distance: Math.max(50, mainDist - seg * 2 - r * 2),
        description: `Crawl maintenu. Focus sur la régularité.`,
        pace: scalePace('RPE 6/10', level),
        restSeconds,
      },
    ]
  } else if (style === 'Vitesse') {
    const sprintDist = level === 'Débutant' ? 25 : 50
    const nbSprints = Math.max(4, Math.floor(mainDist / (sprintDist * 2)))
    const rest = Math.max(50, mainDist - nbSprints * sprintDist)
    const restNote = `${restSeconds > 0 ? restSeconds + 's' : '20s'} de repos entre chaque sprint`
    main = [
      {
        label: `${nbSprints} × ${sprintDist}m Sprint`,
        type: 'main',
        distance: nbSprints * sprintDist,
        description: withEquipment(
          `${nbSprints}× : ${sprintDist}m crawl à fond + récupération dos. ${restNote}.`,
          equipment, ['palmes']
        ),
        pace: scalePace('RPE 9/10', level),
        restSeconds,
        equipment: ['palmes'],
      },
      {
        label: 'Séries de transition',
        type: 'main',
        distance: rest,
        description: withEquipment(
          `${rest}m en 4 nages, 25m chacune.`,
          equipment, ['pull-buoy']
        ),
        pace: scalePace('RPE 6/10', level),
        restSeconds,
      },
    ]
  } else if (style === 'Technique') {
    const seg = round50(mainDist / 4)
    main = [
      {
        label: 'Drill catch-up crawl',
        type: 'main',
        distance: seg,
        description: withEquipment('Attendez que la main avant soit devant avant de tirer.', equipment, ['pull-buoy']),
        pace: scalePace('RPE 4/10', level),
        restSeconds,
        equipment: ['pull-buoy'],
      },
      {
        label: 'Side-kick (rotation hanches)',
        type: 'main',
        distance: seg,
        description: withEquipment('Position latérale, un bras tendu. Travail rotation des hanches.', equipment, ['planche']),
        pace: scalePace('RPE 4/10', level),
        restSeconds,
        equipment: ['planche'],
      },
      {
        label: 'Dos crawl technique',
        type: 'main',
        distance: seg,
        description: 'Focus rotation épaules, bras sorti haut, entrée petit doigt en premier.',
        pace: scalePace('RPE 5/10', level),
        restSeconds,
      },
      {
        label: 'Nage libre application',
        type: 'main',
        distance: Math.max(50, mainDist - seg * 3),
        description: withEquipment('Appliquez toutes les corrections en nage libre relaxée.', equipment, ['palmes']),
        pace: scalePace('RPE 5-6/10', level),
        restSeconds,
      },
    ]
  } else {
    // Mixte
    const endDist = round50(mainDist * 0.4)
    const vitDist = round50(mainDist * 0.35)
    const techDist = Math.max(50, mainDist - endDist - vitDist)
    main = [
      {
        label: 'Bloc Endurance',
        type: 'main',
        distance: endDist,
        description: withEquipment(`${endDist}m crawl allure modérée. Respiration 3 cycles.${restLabel}`, equipment, ['palmes']),
        pace: scalePace('RPE 5/10', level),
        restSeconds,
        equipment: equipment.length ? ['palmes'] : [],
      },
      {
        label: 'Bloc Vitesse',
        type: 'main',
        distance: vitDist,
        description: withEquipment(
          `${Math.floor(vitDist / 50)} × 50m crawl sprint.`,
          equipment, ['palmes']
        ),
        pace: scalePace('RPE 8-9/10', level),
        restSeconds,
        equipment: ['palmes'],
      },
      {
        label: 'Bloc Technique',
        type: 'main',
        distance: techDist,
        description: withEquipment(`${techDist}m : 25m drill + 25m nage complète.`, equipment, ['pull-buoy']),
        pace: scalePace('RPE 4/10', level),
        restSeconds,
        equipment: ['pull-buoy'],
      },
    ]
  }

  const cooldown: SwimBlock[] = [
    {
      label: 'Retour au calme 1',
      type: 'cooldown',
      distance: round50(cooldownDist * 0.6),
      description: 'Dos crawl lent. Diminuez progressivement l\'effort.',
      pace: scalePace('RPE 3/10', level),
      restSeconds,
    },
    {
      label: 'Retour au calme 2',
      type: 'cooldown',
      distance: Math.max(50, cooldownDist - round50(cooldownDist * 0.6)),
      description: 'Brasse ou dos. Respirations profondes, finissez sur légèreté.',
      pace: scalePace('RPE 2/10', level),
    },
  ]

  return { style, level, equipment, restSeconds, totalDistance: distance, warmup, main, cooldown }
}
