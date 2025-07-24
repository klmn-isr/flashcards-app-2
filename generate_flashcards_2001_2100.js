const fs = require('fs');

// Data from he_50k.txt lines 2001-2100 with transcriptions and translations
const data = [
  { hebrew: "תזוז", frequency: 7869, transcription: "тазуз", translation: "двигайся" },
  { hebrew: "גדולות", frequency: 7856, transcription: "гдолот", translation: "большие" },
  { hebrew: "אמן", frequency: 7856, transcription: "амен", translation: "художник" },
  { hebrew: "נאמר", frequency: 7852, transcription: "неэмар", translation: "сказано" },
  { hebrew: "לעקוב", frequency: 7843, transcription: "леаков", translation: "следить" },
  { hebrew: "אנשה", frequency: 7843, transcription: "анша", translation: "человек" },
  { hebrew: "להיפטר", frequency: 7829, transcription: "леhипатер", translation: "избавиться" },
  { hebrew: "האבטחה", frequency: 7811, transcription: "hаавтаха", translation: "охрана" },
  { hebrew: "שאבא", frequency: 7808, transcription: "шеаба", translation: "что папа" },
  { hebrew: "רוג", frequency: 7803, transcription: "рог", translation: "Рог" },
  { hebrew: "צד", frequency: 7802, transcription: "цад", translation: "сторона" },
  { hebrew: "נקודה", frequency: 7801, transcription: "некуда", translation: "точка" },
  { hebrew: "שחקן", frequency: 7799, transcription: "шахкан", translation: "игрок" },
  { hebrew: "מוטב", frequency: 7793, transcription: "мутав", translation: "лучше" },
  { hebrew: "המפתחות", frequency: 7791, transcription: "hамафтеахот", translation: "ключи" },
  { hebrew: "עבדתי", frequency: 7790, transcription: "авадети", translation: "я работал" },
  { hebrew: "קרטר", frequency: 7787, transcription: "картер", translation: "Картер" },
  { hebrew: "הרכבת", frequency: 7785, transcription: "hаркавэт", translation: "поезд" },
  { hebrew: "הבלש", frequency: 7783, transcription: "hабалаш", translation: "детектив" },
  { hebrew: "אהבת", frequency: 7780, transcription: "ахавта", translation: "ты любил" },
  { hebrew: "נקודות", frequency: 7774, transcription: "некудот", translation: "точки" },
  { hebrew: "שיחות", frequency: 7773, transcription: "сихот", translation: "разговоры" },
  { hebrew: "בעיניי", frequency: 7771, transcription: "беэнай", translation: "по моему мнению" },
  { hebrew: "אישית", frequency: 7766, transcription: "ишит", translation: "личная" },
  { hebrew: "קיים", frequency: 7758, transcription: "кайам", translation: "существует" },
  { hebrew: "כוחות", frequency: 7755, transcription: "кохот", translation: "силы" },
  { hebrew: "חוסר", frequency: 7755, transcription: "хосер", translation: "отсутствие" },
  { hebrew: "ההיא", frequency: 7745, transcription: "hаhи", translation: "та" },
  { hebrew: "פגע", frequency: 7742, transcription: "пага", translation: "ударил" },
  { hebrew: "לנהוג", frequency: 7740, transcription: "линохаг", translation: "водить" },
  { hebrew: "גיבור", frequency: 7737, transcription: "гибор", translation: "герой" },
  { hebrew: "תשובה", frequency: 7733, transcription: "тшува", translation: "ответ" },
  { hebrew: "רגשות", frequency: 7731, transcription: "регашот", translation: "чувства" },
  { hebrew: "השוטר", frequency: 7730, transcription: "hашотер", translation: "полицейский" },
  { hebrew: "תפסיקו", frequency: 7728, transcription: "тафсику", translation: "прекратите" },
  { hebrew: "מהנה", frequency: 7710, transcription: "механе", translation: "приятный" },
  { hebrew: "לשכב", frequency: 7709, transcription: "лишкав", translation: "лежать" },
  { hebrew: "להבטיח", frequency: 7699, transcription: "леhавтиах", translation: "обещать" },
  { hebrew: "בפרקים", frequency: 7689, transcription: "бепраким", translation: "в главах" },
  { hebrew: "מרוצה", frequency: 7685, transcription: "меруца", translation: "доволен" },
  { hebrew: "לשיר", frequency: 7684, transcription: "лашир", translation: "петь" },
  { hebrew: "שמן", frequency: 7679, transcription: "шемен", translation: "масло" },
  { hebrew: "צבע", frequency: 7679, transcription: "цэва", translation: "цвет" },
  { hebrew: "למדי", frequency: 7668, transcription: "ламади", translation: "учись" },
  { hebrew: "מכך", frequency: 7666, transcription: "миках", translation: "от этого" },
  { hebrew: "דייב", frequency: 7664, transcription: "дейв", translation: "Дейв" },
  { hebrew: "למקרה", frequency: 7663, transcription: "лемикре", translation: "на случай" },
  { hebrew: "לובש", frequency: 7662, transcription: "ловеш", translation: "носит" },
  { hebrew: "לשקר", frequency: 7661, transcription: "лишакер", translation: "лгать" },
  { hebrew: "המחשה", frequency: 7660, transcription: "hамхаша", translation: "иллюстрация" },
  { hebrew: "גבוּהה", frequency: 7654, transcription: "гавоhа", translation: "высокий" },
  { hebrew: "מגביל", frequency: 7653, transcription: "магбиль", translation: "ограничивает" },
  { hebrew: "ירה", frequency: 7652, transcription: "яра", translation: "стрелял" },
  { hebrew: "שיכור", frequency: 7652, transcription: "шикор", translation: "пьяный" },
  { hebrew: "נפל", frequency: 7649, transcription: "нафаль", translation: "упал" },
  { hebrew: "יתכן", frequency: 7638, transcription: "итахен", translation: "возможно" },
  { hebrew: "להחליט", frequency: 7634, transcription: "леhахлит", translation: "решить" },
  { hebrew: "עליכם", frequency: 7631, transcription: "алейхем", translation: "на вас" },
  { hebrew: "אוה", frequency: 7627, transcription: "оhэ", translation: "Оэ" },
  { hebrew: "לנשום", frequency: 7616, transcription: "леншом", translation: "дышать" },
  { hebrew: "ראו", frequency: 7603, transcription: "рау", translation: "увидели" },
  { hebrew: "לבטוח", frequency: 7600, transcription: "левтоах", translation: "доверять" },
  { hebrew: "החוף", frequency: 7595, transcription: "hахоф", translation: "пляж" },
  { hebrew: "טעים", frequency: 7592, transcription: "таим", translation: "вкусный" },
  { hebrew: "בוכה", frequency: 7592, transcription: "бохе", translation: "плачет" },
  { hebrew: "הפסגה", frequency: 7590, transcription: "hаписга", translation: "вершина" },
  { hebrew: "קראת", frequency: 7588, transcription: "карата", translation: "ты читал" },
  { hebrew: "משתמשים", frequency: 7585, transcription: "миштамшим", translation: "используют" },
  { hebrew: "רעים", frequency: 7582, transcription: "раим", translation: "плохие" },
  { hebrew: "שמות", frequency: 7581, transcription: "шемот", translation: "имена" },
  { hebrew: "מג", frequency: 7576, transcription: "маг", translation: "Маг" },
  { hebrew: "האהוב", frequency: 7575, transcription: "hаахув", translation: "любимый" },
  { hebrew: "לארי", frequency: 7573, transcription: "лари", translation: "Лари" },
  { hebrew: "בהריון", frequency: 7573, transcription: "беhерайон", translation: "беременная" },
  { hebrew: "השטח", frequency: 7572, transcription: "hашетах", translation: "территория" },
  { hebrew: "נותנים", frequency: 7571, transcription: "нотним", translation: "дают" },
  { hebrew: "קוד", frequency: 7569, transcription: "код", translation: "код" },
  { hebrew: "למכונית", frequency: 7565, transcription: "лемехонит", translation: "к машине" },
  { hebrew: "כועסת", frequency: 7558, transcription: "коэсет", translation: "злится" },
  { hebrew: "קשה", frequency: 7556, transcription: "каше", translation: "трудно" },
  { hebrew: "לשני", frequency: 7553, transcription: "лашни", translation: "ко второму" },
  { hebrew: "המקרא", frequency: 7550, transcription: "hамикра", translation: "Писание" },
  { hebrew: "למסיבה", frequency: 7547, transcription: "лемесиба", translation: "на вечеринку" },
  { hebrew: "האנק", frequency: 7542, transcription: "hаанк", translation: "Ганк" },
  { hebrew: "נותנת", frequency: 7542, transcription: "нотэнет", translation: "дает" },
  { hebrew: "בטלוויזיה", frequency: 7533, transcription: "бэтелевизия", translation: "по телевизору" },
  { hebrew: "לסדר", frequency: 7526, transcription: "лесадер", translation: "организовать" },
  { hebrew: "מבחינה", frequency: 7524, transcription: "мибхина", translation: "с точки зрения" },
  { hebrew: "לקפוץ", frequency: 7512, transcription: "ликфоц", translation: "прыгать" },
  { hebrew: "תבין", frequency: 7505, transcription: "тавин", translation: "поймешь" },
  { hebrew: "לאדם", frequency: 7501, transcription: "леадам", translation: "человеку" },
  { hebrew: "קואט", frequency: 7497, transcription: "куат", translation: "Куат" },
  { hebrew: "מיוחדת", frequency: 7489, transcription: "мейухедет", translation: "особенная" },
  { hebrew: "מולי", frequency: 7485, transcription: "мули", translation: "Мули" },
  { hebrew: "השופט", frequency: 7483, transcription: "hашофет", translation: "судья" },
  { hebrew: "לסבול", frequency: 7482, transcription: "лесбол", translation: "страдать" },
  { hebrew: "מהן", frequency: 7471, transcription: "маhен", translation: "от них" },
  { hebrew: "the", frequency: 7468, transcription: "зе", translation: "the" },
  { hebrew: "קסון", frequency: 7464, transcription: "ксон", translation: "Ксон" },
  { hebrew: "בשלב", frequency: 7462, transcription: "бешалав", translation: "на этапе" }
];

// Generate flashcards
const flashcards = data.map((item, index) => {
  const id = 2001 + index;
  const frequency = Math.log(item.frequency).toFixed(2);
  
  // Determine type and gender based on word patterns
  let type = "noun";
  let gender = "masculine";
  
  if (item.hebrew.endsWith("ים") || item.hebrew.endsWith("ות")) {
    type = "adjective";
    gender = "masculine";
  } else if (item.hebrew.endsWith("ת") && !item.hebrew.endsWith("ות")) {
    type = "adjective";
    gender = "feminine";
  } else if (item.hebrew.startsWith("ל") || item.hebrew.startsWith("מ") || item.hebrew.startsWith("ב") || item.hebrew.startsWith("כ") || item.hebrew.startsWith("ש")) {
    type = "preposition";
    gender = "common";
  } else if (item.hebrew.includes("י") && item.hebrew.includes("ו")) {
    type = "verb";
    gender = "common";
  }
  
  // Generate random number with 5 digits precision
  const random = parseFloat(Math.random().toFixed(5));
  
  return {
    id: id.toString(),
    type,
    gender,
    root: item.hebrew,
    frequency: parseFloat(frequency),
    hebrew: item.hebrew,
    transcription: item.transcription,
    translation: item.translation,
    isActive: true,
    learned: false,
    random,
    tags: [type, gender]
  };
});

// Write to file
const output = JSON.stringify(flashcards, null, 2);
fs.writeFileSync('frontend/src/data/flashcards2001-2100.json', output);

console.log(`Generated ${flashcards.length} flashcards with IDs 2001-2100`);
console.log('Sample frequencies:');
flashcards.slice(0, 5).forEach(card => {
  console.log(`${card.id}: ${card.hebrew} -> ${card.frequency}`);
}); 