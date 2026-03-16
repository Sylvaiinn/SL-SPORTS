// src/lib/swimGenerator.ts
export type SwimStyle = 'Endurance' | 'Vitesse' | 'Technique' | 'Mixte'
export type SwimDistance = 1000 | 1500 | 2500 | 3500

export interface SwimBlock {
  label: string
  type: 'warmup' | 'main' | 'cooldown' | 'rest'
  distance: number
  description: string
  pace?: string
}

export interface SwimPlan {
  style: SwimStyle
  totalDistance: number
  warmup: SwimBlock[]
  main: SwimBlock[]
  cooldown: SwimBlock[]
}

function round50(n: number): number {
  return Math.round(n / 50) * 50
}

export function generateSwimSession(style: SwimStyle, distance: SwimDistance): SwimPlan {
  const warmupDist = round50(distance * 0.18)
  const cooldownDist = round50(distance * 0.12)
  const mainDist = distance - warmupDist - cooldownDist

  const warmup: SwimBlock[] = [
    {
      label: 'Échauffement libre',
      type: 'warmup',
      distance: round50(warmupDist * 0.5),
      description: 'Crawl tranquille, concentrez-vous sur la technique de respiration.',
      pace: 'RPE 3/10',
    },
    {
      label: 'Exercices de bras',
      type: 'warmup',
      distance: round50(warmupDist * 0.3),
      description: 'Bras uniquement (pull-buoy entre les jambes), dos crawl alternés.',
      pace: 'RPE 4/10',
    },
    {
      label: 'Exercices de jambes',
      type: 'warmup',
      distance: round50(warmupDist * 0.2),
      description: 'Jambes uniquement avec planche. Crawl puis dos.',
      pace: 'RPE 4/10',
    },
  ]

  let main: SwimBlock[] = []

  if (style === 'Endurance') {
    const seg = round50(mainDist / 3)
    main = [
      {
        label: 'Série longue 1',
        type: 'main',
        distance: seg,
        description: `${seg}m crawl continu. Rythme régulier, expiration lente sous l'eau.`,
        pace: 'RPE 5-6/10',
      },
      {
        label: 'Récupération active',
        type: 'rest',
        distance: round50(seg * 0.2),
        description: 'Dos crawl tranquille, bras le long du corps, flottaison.',
        pace: 'RPE 2/10',
      },
      {
        label: 'Série longue 2',
        type: 'main',
        distance: seg,
        description: `${seg}m crawl. Augmentez légèrement l'allure sur les 100 derniers mètres.`,
        pace: 'RPE 6-7/10',
      },
      {
        label: 'Récupération active',
        type: 'rest',
        distance: round50(seg * 0.2),
        description: 'Dos crawl, respirez profondément.',
        pace: 'RPE 2/10',
      },
      {
        label: 'Série finale',
        type: 'main',
        distance: mainDist - seg * 2 - round50(seg * 0.4),
        description: 'Crawl maintenu. Focus sur la régularité des cycles de bras.',
        pace: 'RPE 6/10',
      },
    ]
  } else if (style === 'Vitesse') {
    const sprintDist = 50
    const nbSprints = Math.floor(mainDist / (sprintDist * 2))
    const rest = round50(mainDist - nbSprints * sprintDist)
    main = [
      {
        label: `${nbSprints} × ${sprintDist}m Sprint`,
        type: 'main',
        distance: nbSprints * sprintDist,
        description: `Répétez ${nbSprints} fois : ${sprintDist}m crawl à fond + ${sprintDist}m récup dos.`,
        pace: 'RPE 9/10 (sprint) / RPE 2/10 (récup)',
      },
      {
        label: 'Séries de transition',
        type: 'main',
        distance: rest,
        description: `${rest}m en 4 nages (crawl→dos→brasse→papillon si possible), 25m chacune.`,
        pace: 'RPE 6/10',
      },
    ]
  } else if (style === 'Technique') {
    const seg = round50(mainDist / 4)
    main = [
      {
        label: 'Drill catch-up crawl',
        type: 'main',
        distance: seg,
        description: 'Crawl : attendez que la main avant soit devant avant de tirer. Focus entry de main.',
        pace: 'RPE 4/10',
      },
      {
        label: 'Natation sur le côté (side-kick)',
        type: 'main',
        distance: seg,
        description: 'Position latérale, un bras tendu. Travail de la rotation des hanches.',
        pace: 'RPE 4/10',
      },
      {
        label: 'Dos crawl technique',
        type: 'main',
        distance: seg,
        description: 'Dos : focus rotation des épaules, bras sorti haut, entrée petit doigt en premier.',
        pace: 'RPE 5/10',
      },
      {
        label: 'Nage complète consolidation',
        type: 'main',
        distance: mainDist - seg * 3,
        description: 'Appliquez les corrections des exercices précédents en nage libre.',
        pace: 'RPE 5-6/10',
      },
    ]
  } else {
    // Mixte
    const enduranceDist = round50(mainDist * 0.4)
    const vitesseDist = round50(mainDist * 0.35)
    const techniqueDist = mainDist - enduranceDist - vitesseDist
    main = [
      {
        label: 'Bloc endurance',
        type: 'main',
        distance: enduranceDist,
        description: `${enduranceDist}m crawl à allure modérée. Respiration tous les 3 cycles.`,
        pace: 'RPE 5/10',
      },
      {
        label: 'Bloc vitesse',
        type: 'main',
        distance: vitesseDist,
        description: `${Math.floor(vitesseDist / 50)} × 50m crawl sprint, 20 sec récup entre chaque.`,
        pace: 'RPE 8-9/10',
      },
      {
        label: 'Bloc technique',
        type: 'main',
        distance: techniqueDist,
        description: `${techniqueDist}m : 25m drill catch-up + 25m nage complète. Alternez.`,
        pace: 'RPE 4/10',
      },
    ]
  }

  const cooldown: SwimBlock[] = [
    {
      label: 'Retour au calme 1',
      type: 'cooldown',
      distance: round50(cooldownDist * 0.6),
      description: 'Dos crawl lent, jambes en opposition douce. Diminuez l\'effort progressivement.',
      pace: 'RPE 3/10',
    },
    {
      label: 'Retour au calme 2',
      type: 'cooldown',
      distance: cooldownDist - round50(cooldownDist * 0.6),
      description: 'Brasse ou dos, respirations profondes. Finissez sur une sensation de légèreté.',
      pace: 'RPE 2/10',
    },
  ]

  return { style, totalDistance: distance, warmup, main, cooldown }
}
