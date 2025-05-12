import { FormData } from '../types';

export const formData: FormData = {
  groups: [
    { value: 'Pre Press', label: 'Pre Press' },
    { value: 'Press', label: 'Press' },
    { value: 'Post Press', label: 'Post Press' },
    { value: 'Packaging', label: 'Packaging' }
  ],
  models: {
    'Pre Press': [
      { value: 'Suprasetter', label: 'Suprasetter' },
      { value: 'Software', label: 'Software' },
      { value: 'Topsetter', label: 'Topsetter' }
    ],
    'Press': [
      { value: 'GTO52', label: 'GTO52' },
      { value: 'SM52', label: 'SM52' },
      { value: 'S Offset', label: 'S Offset' },
      { value: 'M Offset', label: 'M Offset' },
      { value: 'K Offset', label: 'K Offset' },
      { value: 'CD74-F Format', label: 'CD74-F Format' },
      { value: 'XL75', label: 'XL75' },
      { value: 'CD102', label: 'CD102' },
      { value: 'SM102', label: 'SM102' },
      { value: 'PM74', label: 'PM74' },
      { value: 'CD74-C-Format', label: 'CD74-C-Format' },
      { value: 'PM52', label: 'PM52' }
    ],
    'Post Press': [
      { value: 'STAHL T52', label: 'STAHL T52' },
      { value: 'STAHL KC 66', label: 'STAHL KC 66' },
      { value: 'Polar 115', label: 'Polar 115' },
      { value: 'Polar 137', label: 'Polar 137' },
      { value: 'Polar 155', label: 'Polar 155' },
      { value: 'Polar 176', label: 'Polar 176' },
      { value: 'Polar 92', label: 'Polar 92' },
      { value: 'Polar 78', label: 'Polar 78' },
      { value: 'Polar 66', label: 'Polar 66' }
    ],
    'Packaging': [
      { value: 'Foiling Machines', label: 'Foiling Machines' },
      { value: 'Die Cutting Machines', label: 'Die Cutting Machines' }
    ]
  },
  items: {
    'Pre Press': {
      'Suprasetter': [
        { value: 'Suprasetter 52', label: 'Suprasetter 52' },
        { value: 'Suprasetter 74', label: 'Suprasetter 74' },
        { value: 'Suprasetter 75', label: 'Suprasetter 75' },
        { value: 'Suprasetter 105', label: 'Suprasetter 105' },
        { value: 'Suprasetter 106', label: 'Suprasetter 106' },
        { value: 'Suprasetter A52', label: 'Suprasetter A52' },
        { value: 'Suprasetter A74', label: 'Suprasetter A74' },
        { value: 'Suprasetter A75', label: 'Suprasetter A75' },
        { value: 'Suprasetter A105', label: 'Suprasetter A105' },
        { value: 'Suprasetter A106', label: 'Suprasetter A106' }
      ]
    },
    'Press': {
      'GTO52': [
        { value: 'GTO52 - 1', label: 'GTO52 - 1' },
        { value: 'GTO52 - 2', label: 'GTO52 - 2' },
        { value: 'GTO52 - 2P', label: 'GTO52 - 2P' },
        { value: 'GTO52 - 4', label: 'GTO52 - 4' },
        { value: 'GTO52 - 4P3', label: 'GTO52 - 4P3' },
        { value: 'GTO52 - 5', label: 'GTO52 - 5' },
        { value: 'GTO52 - 5P2', label: 'GTO52 - 5P2' },
        { value: 'GTO52 - 5P3', label: 'GTO52 - 5P3' },
        { value: 'GTO52 - 6', label: 'GTO52 - 6' }
      ],
      'SM52': [
        { value: 'SM52 - 1', label: 'SM52 - 1' },
        { value: 'SM52 - 2', label: 'SM52 - 2' },
        { value: 'SM52 - 2P', label: 'SM52 - 2P' },
        { value: 'SM52 - 4', label: 'SM52 - 4' },
        { value: 'SM52 - 4H', label: 'SM52 - 4H' },
        { value: 'SM52 - 4H - P3', label: 'SM52 - 4H - P3' },
        { value: 'SM52 - 4H - L', label: 'SM52 - 4H - L' },
        { value: 'SM52 - 5', label: 'SM52 - 5' },
        { value: 'SM52 - 5H', label: 'SM52 - 5H' },
        { value: 'SM52 - 5H - L', label: 'SM52 - 5H - L' },
        { value: 'SM52 - 6H', label: 'SM52 - 6H' },
        { value: 'SM52 - 6H - L', label: 'SM52 - 6H - L' }
      ],
      'S Offset': [
        { value: 'SORS', label: 'SORS' },
        { value: 'SORSZ', label: 'SORSZ' },
        { value: 'SORD', label: 'SORD' },
        { value: 'SORDZ', label: 'SORDZ' },
        { value: 'SORM', label: 'SORM' },
        { value: 'SORMZ', label: 'SORMZ' }
      ],
      'M Offset': [
        { value: 'MO E', label: 'MO E' },
        { value: 'MO S', label: 'MO S' },
        { value: 'MO Z', label: 'MO Z' },
        { value: 'MOV', label: 'MOV' },
        { value: 'MOV H', label: 'MOV H' },
        { value: 'MOV H - L', label: 'MOV H - L' },
        { value: 'MO F', label: 'MO F' },
        { value: 'MO F - L', label: 'MO F - L' }
      ],
      'K Offset': [
        { value: 'SM74 - 1', label: 'SM74 - 1' },
        { value: 'SM74 - 2', label: 'SM74 - 2' },
        { value: 'SM74 - 2H', label: 'SM74 - 2H' },
        { value: 'SM74 - 2H - P', label: 'SM74 - 2H - P' },
        { value: 'SM74 - 2H - L', label: 'SM74 - 2H - L' },
        { value: 'SM74 - 4', label: 'SM74 - 4' },
        { value: 'SM74 - 4H', label: 'SM74 - 4H' },
        { value: 'SM74 - 4H - L', label: 'SM74 - 4H - L' },
        { value: 'SM74 - 4H - P3', label: 'SM74 - 4H - P3' },
        { value: 'SM74 - 5H', label: 'SM74 - 5H' },
        { value: 'SM74 - 5H - L', label: 'SM74 - 5H - L' },
        { value: 'SM74 - 5H - P3', label: 'SM74 - 5H - P3' },
        { value: 'SM74 - 6H', label: 'SM74 - 6H' },
        { value: 'SM74 - 6H - L', label: 'SM74 - 6H - L' },
        { value: 'SM74 - 6H - P3 - L', label: 'SM74 - 6H - P3 - L' },
        { value: 'SM74 - 8H - P5', label: 'SM74 - 8H - P5' },
        { value: 'SM74 - 8H - P5 - L', label: 'SM74 - 8H - P5 - L' },
        { value: 'SM74 - 10H - P5', label: 'SM74 - 10H - P5' }
      ]
    },
    'Post Press': {
      'STAHL T52': [
        { value: 'STAHL T 52 4-4-X', label: 'STAHL T 52 4-4-X' },
        { value: 'STAHL Ti 55-4-4', label: 'STAHL Ti 55-4-4' },
        { value: 'STAHL TA 52-4-4', label: 'STAHL TA 52-4-4' }
      ],
      'Polar 115': [
        { value: 'Polar 115', label: 'Polar 115' },
        { value: 'Polar 115 E', label: 'Polar 115 E' },
        { value: 'Polar 115 X', label: 'Polar 115 X' },
        { value: 'Polar 115 XT', label: 'Polar 115 XT' },
        { value: 'Polar 115 EM', label: 'Polar 115 EM' }
      ],
      'Polar 78': [
        { value: 'Polar 78', label: 'Polar 78' },
        { value: 'Polar 78 X', label: 'Polar 78 X' },
        { value: 'Polar 78 XT', label: 'Polar 78 XT' }
      ]
    },
    'Packaging': {
      'Foiling Machines': [
        { value: 'GTP', label: 'GTP' }
      ]
    }
  },
  years: [
    { value: '1960 - 1965', label: '1960 - 1965' },
    { value: '1966 - 1970', label: '1966 - 1970' },
    { value: '1971 - 1975', label: '1971 - 1975' },
    { value: '1976 - 1980', label: '1976 - 1980' },
    { value: '1981 - 1985', label: '1981 - 1985' },
    { value: '1986 - 1990', label: '1986 - 1990' },
    { value: '1991 - 1995', label: '1991 - 1995' },
    { value: '1996 - 2000', label: '1996 - 2000' },
    { value: '2001 - 2005', label: '2001 - 2005' },
    { value: '2006 - 2010', label: '2006 - 2010' },
    { value: '2011 - 2015', label: '2011 - 2015' },
    { value: '2020 - 2024', label: '2020 - 2024' }
  ]
};