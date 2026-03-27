import { Class, Student, DailyAttendance } from './types';

export const initialClasses: Class[] = [
  { id: 'c1', name: '6ème A', building: 'Bâtiment Principal' },
  { id: 'c2', name: '5ème B', building: 'Annexe Sciences' },
  { id: 'c3', name: '4ème C', building: 'Bâtiment Principal' },
  { id: 'c4', name: '3ème A', building: 'Bâtiment Ouest' },
  { id: 'c5', name: '3ème B', building: 'Bâtiment Ouest' },
];

export const initialStudents: Student[] = [
  // 6ème A
  { id: 's1', lastName: 'Dupont', firstName: 'Lucas', classId: 'c1' },
  { id: 's2', lastName: 'Martin', firstName: 'Emma', classId: 'c1' },
  { id: 's3', lastName: 'Bernard', firstName: 'Hugo', classId: 'c1' },
  { id: 's4', lastName: 'Thomas', firstName: 'Chloé', classId: 'c1' },
  { id: 's5', lastName: 'Petit', firstName: 'Léo', classId: 'c1' },
  { id: 's6', lastName: 'Robert', firstName: 'Lina', classId: 'c1' },
  { id: 's7', lastName: 'Richard', firstName: 'Arthur', classId: 'c1' },
  { id: 's8', lastName: 'Durand', firstName: 'Léa', classId: 'c1' },
  { id: 's9', lastName: 'Dubois', firstName: 'Louis', classId: 'c1' },
  { id: 's10', lastName: 'Moreau', firstName: 'Jade', classId: 'c1' },
  { id: 's11', lastName: 'Laurent', firstName: 'Gabriel', classId: 'c1' },
  { id: 's12', lastName: 'Simon', firstName: 'Alice', classId: 'c1' },
  { id: 's13', lastName: 'Michel', firstName: 'Jules', classId: 'c1' },
  { id: 's14', lastName: 'Lefebvre', firstName: 'Anna', classId: 'c1' },
  { id: 's15', lastName: 'Leroy', firstName: 'Maël', classId: 'c1' },

  // 5ème B
  { id: 's16', lastName: 'Roux', firstName: 'Inès', classId: 'c2' },
  { id: 's17', lastName: 'David', firstName: 'Paul', classId: 'c2' },
  { id: 's18', lastName: 'Bertrand', firstName: 'Sarah', classId: 'c2' },
  { id: 's19', lastName: 'Morel', firstName: 'Tom', classId: 'c2' },
  { id: 's20', lastName: 'Fournier', firstName: 'Juliette', classId: 'c2' },
  { id: 's21', lastName: 'Girard', firstName: 'Adam', classId: 'c2' },
  { id: 's22', lastName: 'Bonnet', firstName: 'Romane', classId: 'c2' },
  { id: 's23', lastName: 'Francois', firstName: 'Victor', classId: 'c2' },
  { id: 's24', lastName: 'Roche', firstName: 'Camille', classId: 'c2' },
  { id: 's25', lastName: 'Renard', firstName: 'Nathan', classId: 'c2' },
  { id: 's26', lastName: 'Blanc', firstName: 'Lola', classId: 'c2' },
  { id: 's27', lastName: 'Garnier', firstName: 'Gabin', classId: 'c2' },
  { id: 's28', lastName: 'Chevalier', firstName: 'Zoé', classId: 'c2' },
  { id: 's29', lastName: 'Muller', firstName: 'Raphaël', classId: 'c2' },
  { id: 's30', lastName: 'Guerin', firstName: 'Eva', classId: 'c2' },

  // 4ème C
  { id: 's31', lastName: 'Legrand', firstName: 'Mila', classId: 'c3' },
  { id: 's32', lastName: 'Gauthier', firstName: 'Aaron', classId: 'c3' },
  { id: 's33', lastName: 'Perrin', firstName: 'Rose', classId: 'c3' },
  { id: 's34', lastName: 'Robin', firstName: 'Léon', classId: 'c3' },
  { id: 's35', lastName: 'Clement', firstName: 'Ambre', classId: 'c3' },
  { id: 's36', lastName: 'Morin', firstName: 'Eden', classId: 'c3' },
  { id: 's37', lastName: 'Nicolas', firstName: 'Mia', classId: 'c3' },
  { id: 's38', lastName: 'Henry', firstName: 'Noah', classId: 'c3' },
  { id: 's39', lastName: 'Roussel', firstName: 'Agathe', classId: 'c3' },
  { id: 's40', lastName: 'Mathieu', firstName: 'Marius', classId: 'c3' },
  { id: 's41', lastName: 'Gautier', firstName: 'Julia', classId: 'c3' },
  { id: 's42', lastName: 'Masson', firstName: 'Sacha', classId: 'c3' },
  { id: 's43', lastName: 'Marchand', firstName: 'Nina', classId: 'c3' },
  { id: 's44', lastName: 'Duval', firstName: 'Gaspard', classId: 'c3' },
  { id: 's45', lastName: 'Denis', firstName: 'Léna', classId: 'c3' },

  // 3ème A
  { id: 's46', lastName: 'Dumont', firstName: 'Tiago', classId: 'c4' },
  { id: 's47', lastName: 'Marie', firstName: 'Iris', classId: 'c4' },
  { id: 's48', lastName: 'Lemaire', firstName: 'Maé', classId: 'c4' },
  { id: 's49', lastName: 'Noel', firstName: 'Lou', classId: 'c4' },
  { id: 's50', lastName: 'Meyer', firstName: 'Malo', classId: 'c4' },
  { id: 's51', lastName: 'Dufour', firstName: 'Jeanne', classId: 'c4' },
  { id: 's52', lastName: 'Meunier', firstName: 'Isaac', classId: 'c4' },
  { id: 's53', lastName: 'Brun', firstName: 'Charlie', classId: 'c4' },
  { id: 's54', lastName: 'Blanchard', firstName: 'Victoire', classId: 'c4' },
  { id: 's55', lastName: 'Giraud', firstName: 'Côme', classId: 'c4' },
  { id: 's56', lastName: 'Joly', firstName: 'Margaux', classId: 'c4' },
  { id: 's57', lastName: 'Rivière', firstName: 'Aymeric', classId: 'c4' },
  { id: 's58', lastName: 'Lucas', firstName: 'Clémence', classId: 'c4' },
  { id: 's59', lastName: 'Brunet', firstName: 'Eliott', classId: 'c4' },
  { id: 's60', lastName: 'Gaillard', firstName: 'Olivia', classId: 'c4' },

  // 3ème B
  { id: 's61', lastName: 'Barbier', firstName: 'Robin', classId: 'c5' },
  { id: 's62', lastName: 'Arnaud', firstName: 'Capucine', classId: 'c5' },
  { id: 's63', lastName: 'Martinez', firstName: 'Axel', classId: 'c5' },
  { id: 's64', lastName: 'Gerard', firstName: 'Apolline', classId: 'c5' },
  { id: 's65', lastName: 'Roche', firstName: 'Baptiste', classId: 'c5' },
  { id: 's66', lastName: 'Renard', firstName: 'Lilou', classId: 'c5' },
  { id: 's67', lastName: 'Blanc', firstName: 'Maxence', classId: 'c5' },
  { id: 's68', lastName: 'Garnier', firstName: 'Zélie', classId: 'c5' },
  { id: 's69', lastName: 'Chevalier', firstName: 'Evan', classId: 'c5' },
  { id: 's70', lastName: 'Muller', firstName: 'Clara', classId: 'c5' },
  { id: 's71', lastName: 'Guerin', firstName: 'Mathis', classId: 'c5' },
  { id: 's72', lastName: 'Legrand', firstName: 'Alicia', classId: 'c5' },
  { id: 's73', lastName: 'Gauthier', firstName: 'Timéo', classId: 'c5' },
  { id: 's74', lastName: 'Perrin', firstName: 'Romy', classId: 'c5' },
  { id: 's75', lastName: 'Robin', firstName: 'Nolan', classId: 'c5' },
];

const today = new Date();
const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
const dayBefore = new Date(today); dayBefore.setDate(dayBefore.getDate() - 2);

const formatDate = (d: Date) => d.toISOString().split('T')[0];

export const initialAttendances: DailyAttendance[] = [
  // Yesterday
  { date: formatDate(yesterday), classId: 'c1', isDone: true, absents: [{ studentId: 's2', reason: 'Maladie' }] },
  { date: formatDate(yesterday), classId: 'c2', isDone: true, absents: [{ studentId: 's17', reason: 'Transport' }, { studentId: 's20', reason: 'Inconnu' }] },
  { date: formatDate(yesterday), classId: 'c3', isDone: true, absents: [] },
  { date: formatDate(yesterday), classId: 'c4', isDone: true, absents: [{ studentId: 's48', reason: 'Maladie' }] },
  { date: formatDate(yesterday), classId: 'c5', isDone: true, absents: [] },

  // Day Before
  { date: formatDate(dayBefore), classId: 'c1', isDone: true, absents: [] },
  { date: formatDate(dayBefore), classId: 'c2', isDone: true, absents: [{ studentId: 's17', reason: 'Transport' }] },
  { date: formatDate(dayBefore), classId: 'c3', isDone: true, absents: [{ studentId: 's35', reason: 'Maladie' }, { studentId: 's42', reason: 'Inconnu' }] },
  { date: formatDate(dayBefore), classId: 'c4', isDone: true, absents: [] },
  { date: formatDate(dayBefore), classId: 'c5', isDone: true, absents: [{ studentId: 's61', reason: 'Maladie' }] },
];
