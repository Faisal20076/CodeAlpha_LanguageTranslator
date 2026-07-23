export interface PresetPhrase {
  id: string;
  category: 'Greetings' | 'Travel' | 'Dining' | 'Emergency' | 'Business';
  english: string;
}

export const PRESET_PHRASES: PresetPhrase[] = [
  // Greetings
  { id: 'g1', category: 'Greetings', english: 'Hello, how are you today?' },
  { id: 'g2', category: 'Greetings', english: 'Nice to meet you! My name is Alex.' },
  { id: 'g3', category: 'Greetings', english: 'Thank you very much for your help.' },
  { id: 'g4', category: 'Greetings', english: 'Have a wonderful day ahead!' },

  // Travel
  { id: 't1', category: 'Travel', english: 'Where is the nearest train station?' },
  { id: 't2', category: 'Travel', english: 'How much does a taxi to the airport cost?' },
  { id: 't3', category: 'Travel', english: 'Do you have a map of the city?' },
  { id: 't4', category: 'Travel', english: 'I have a hotel reservation under my name.' },

  // Dining
  { id: 'd1', category: 'Dining', english: 'Could I please see the menu?' },
  { id: 'd2', category: 'Dining', english: 'What do you recommend for dinner?' },
  { id: 'd3', category: 'Dining', english: 'Can I have the check, please?' },
  { id: 'd4', category: 'Dining', english: 'Does this dish contain any nuts or dairy?' },

  // Emergency
  { id: 'e1', category: 'Emergency', english: 'I need urgent medical assistance.' },
  { id: 'e2', category: 'Emergency', english: 'Where is the nearest hospital or pharmacy?' },
  { id: 'e3', category: 'Emergency', english: 'I have lost my passport and wallet.' },

  // Business
  { id: 'b1', category: 'Business', english: 'It was a pleasure doing business with you.' },
  { id: 'b2', category: 'Business', english: 'Could you please send me the updated proposal?' },
  { id: 'b3', category: 'Business', english: 'Let us schedule a quick video call tomorrow.' },
];
