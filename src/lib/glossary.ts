// Plain definitions for the few words the site cannot avoid. Shown as tooltips and listed on About the data.
export const GLOSSARY = {
  allowance: {
    term: 'Lower-price allowance',
    also: 'Also called the winter base. The City calls it the winter water average, winter allowance, or block 1',
    def: "Each meter's monthly amount of water billed at the City's lower price. The City sets it from that meter's average use in December to February. Water above it costs more.",
  },
  higher: {
    term: 'Higher price',
    also: 'Peak surcharge, Tier 2, or block 2 on the bill',
    def: 'Water above the lower-price allowance is billed at a higher price per 1,000 gallons. The bill shows the extra as a peak surcharge.',
  },
  seasonal: {
    term: 'Seasonal percent setting',
    also: 'Seasonal adjust',
    def: 'A percent on the controller that scales every run time up or down at once, for example 100% in summer and 60% in winter.',
  },
  byhand: {
    term: 'Set-by-hand mode',
    also: 'User ET mode',
    def: 'The landscaper sets each run time and the smart controller only scales it for the weather.',
  },
  auto: {
    term: 'Automatic weather mode',
    also: 'Auto mode',
    def: "The smart controller works out each station's water from its plants, soil, sprinklers, sun, and slope, then follows the weather.",
  },
  overseed: {
    term: 'Overseeding',
    def: 'Seeding winter rye into the summer lawn each fall so the park stays green in winter. New rye needs extra water while it sprouts.',
  },
  station: {
    term: 'Station',
    also: 'Zone or valve',
    def: 'One numbered circuit on a controller. Each station opens one valve that waters one part of the landscape.',
  },
  drip: { term: 'Drip', def: 'Small tubes and emitters that water trees and shrubs at the roots.' },
  rotor: { term: 'Rotor', def: 'A sprinkler head that turns slowly and throws water a long way. The park lawn uses rotors.' },
  masterValve: { term: 'Master valve', def: 'The main valve where the water enters the irrigation system. If it leaks, water runs even when nothing is watering.' },
  flowSensor: { term: 'Flow sensor', def: 'A meter on the irrigation line that tells the controller how much water is running, so it can shut off a break.' },
  gpm: { term: 'GPM', def: 'Gallons per minute: how fast a station uses water while it runs.' },
  readPeriod: { term: 'Read period', def: 'The days between two City meter reads. Each bill covers one read period, about a month.' },
} as const

export type GlossaryKey = keyof typeof GLOSSARY
