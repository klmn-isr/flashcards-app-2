const fs = require('fs');

// Data from he_50k.txt lines 1801-1900 with transcriptions and translations
const data = [
  { hebrew: "תאמר", frequency: 8865, transcription: "томар", translation: "скажешь" },
  { hebrew: "מעורב", frequency: 8864, transcription: "меорав", translation: "вовлечён" },
  { hebrew: "וויל", frequency: 8851, transcription: "виль", translation: "Вилл" },
  { hebrew: "טיפשי", frequency: 8846, transcription: "типши", translation: "глупый" },
  { hebrew: "לאורך", frequency: 8845, transcription: "леорех", translation: "вдоль" },
  { hebrew: "במיטה", frequency: 8842, transcription: "бамита", translation: "в кровати" },
  { hebrew: "הממשלה", frequency: 8826, transcription: "hамемшала", translation: "правительство" },
  { hebrew: "נושא", frequency: 8814, transcription: "носэ", translation: "тема" },
  { hebrew: "אנדי", frequency: 8803, transcription: "энди", translation: "Энди" },
  { hebrew: "רייצ", frequency: 8794, transcription: "райц", translation: "Рэйч" },
  { hebrew: "לילדים", frequency: 8783, transcription: "лейеладим", translation: "для детей" },
  { hebrew: "למיטה", frequency: 8780, transcription: "ламита", translation: "в кровать" },
  { hebrew: "לוקחים", frequency: 8763, transcription: "локхим", translation: "берут" },
  { hebrew: "ספרי", frequency: 8758, transcription: "сифри", translation: "мои книги" },
  { hebrew: "אדבר", frequency: 8755, transcription: "адабер", translation: "я поговорю" },
  { hebrew: "צו", frequency: 8745, transcription: "цав", translation: "приказ" },
  { hebrew: "הלכה", frequency: 8740, transcription: "hалаха", translation: "ушла" },
  { hebrew: "תרצי", frequency: 8737, transcription: "тирци", translation: "ты захочешь" },
  { hebrew: "דיבר", frequency: 8730, transcription: "дибер", translation: "говорил" },
  { hebrew: "הומו", frequency: 8723, transcription: "hомо", translation: "гей" },
  { hebrew: "שקר", frequency: 8719, transcription: "шекер", translation: "ложь" },
  { hebrew: "צדק", frequency: 8719, transcription: "цедек", translation: "правда" },
  { hebrew: "סונכרן", frequency: 8718, transcription: "сунхран", translation: "синхронизирован" },
  { hebrew: "הראשי", frequency: 8717, transcription: "hараши", translation: "главный" },
  { hebrew: "מלך", frequency: 8711, transcription: "мелех", translation: "король" },
  { hebrew: "הצלחת", frequency: 8703, transcription: "hицлахта", translation: "ты преуспел" },
  { hebrew: "תיכנס", frequency: 8702, transcription: "тиканес", translation: "войдёшь" },
  { hebrew: "משמעות", frequency: 8701, transcription: "машмаут", translation: "значение" },
  { hebrew: "קחו", frequency: 8700, transcription: "кху", translation: "берите" },
  { hebrew: "התעופה", frequency: 8699, transcription: "hатеуфа", translation: "авиация" },
  { hebrew: "למנוע", frequency: 8693, transcription: "лимноа", translation: "предотвратить" },
  { hebrew: "משטרה", frequency: 8685, transcription: "миштара", translation: "полиция" },
  { hebrew: "קונה", frequency: 8684, transcription: "конэ", translation: "покупатель" },
  { hebrew: "העניינים", frequency: 8679, transcription: "hаиньяним", translation: "дела" },
  { hebrew: "לדמיין", frequency: 8675, transcription: "ледамьен", translation: "представить" },
  { hebrew: "קי", frequency: 8671, transcription: "ки", translation: "Ки" },
  { hebrew: "חשובה", frequency: 8658, transcription: "хашува", translation: "важная" },
  { hebrew: "אליס", frequency: 8655, transcription: "элис", translation: "Элис" },
  { hebrew: "שנמצא", frequency: 8654, transcription: "шенимца", translation: "который находится" },
  { hebrew: "בכנות", frequency: 8633, transcription: "бекенут", translation: "честно" },
  { hebrew: "תיקח", frequency: 8631, transcription: "тиках", translation: "возьмёшь" },
  { hebrew: "לוקחת", frequency: 8624, transcription: "локахат", translation: "берёт" },
  { hebrew: "לסגור", frequency: 8624, transcription: "лисгор", translation: "закрыть" },
  { hebrew: "המטוס", frequency: 8620, transcription: "hаматос", translation: "самолёт" },
  { hebrew: "ידידי", frequency: 8615, transcription: "йедиди", translation: "мой друг" },
  { hebrew: "שישי", frequency: 8613, transcription: "шиши", translation: "пятница" },
  { hebrew: "תדבר", frequency: 8602, transcription: "тидабер", translation: "поговоришь" },
  { hebrew: "שרק", frequency: 8600, transcription: "шэрак", translation: "только" },
  { hebrew: "חזרתי", frequency: 8599, transcription: "хазарти", translation: "я вернулся" },
  { hebrew: "מרטין", frequency: 8593, transcription: "мартин", translation: "Мартин" },
  { hebrew: "להרשות", frequency: 8590, transcription: "леhаршот", translation: "разрешить" },
  { hebrew: "ידעו", frequency: 8589, transcription: "яду", translation: "знают" },
  { hebrew: "סביר", frequency: 8586, transcription: "савир", translation: "вероятно" },
  { hebrew: "לגנוב", frequency: 8581, transcription: "лиגנоб", translation: "украсть" },
  { hebrew: "צוחקת", frequency: 8568, transcription: "цохекет", translation: "смеётся" },
  { hebrew: "צופה", frequency: 8551, transcription: "цофэ", translation: "наблюдает" },
  { hebrew: "מתקשר", frequency: 8546, transcription: "миткашер", translation: "звонит" },
  { hebrew: "תוכלו", frequency: 8545, transcription: "тухлу", translation: "сможете" },
  { hebrew: "טד", frequency: 8538, transcription: "тэд", translation: "Тэд" },
  { hebrew: "דיוויד", frequency: 8538, transcription: "дэвид", translation: "Дэвид" },
  { hebrew: "דרכים", frequency: 8534, transcription: "драхим", translation: "пути" },
  { hebrew: "הימים", frequency: 8534, transcription: "hаямим", translation: "дни" },
  { hebrew: "למדתי", frequency: 8522, transcription: "ламадети", translation: "я учился" },
  { hebrew: "פיל", frequency: 8521, transcription: "пиль", translation: "слон" },
  { hebrew: "אינם", frequency: 8520, transcription: "эйнам", translation: "не являются" },
  { hebrew: "המסיבה", frequency: 8518, transcription: "hамесиба", translation: "вечеринка" },
  { hebrew: "תהרוג", frequency: 8516, transcription: "тахарог", translation: "убьёшь" },
  { hebrew: "קום", frequency: 8512, transcription: "кум", translation: "встань" },
  { hebrew: "בצרות", frequency: 8512, transcription: "бецарот", translation: "в беде" },
  { hebrew: "אמי", frequency: 8512, transcription: "ими", translation: "моя мама" },
  { hebrew: "ני", frequency: 8509, transcription: "ни", translation: "я" },
  { hebrew: "יהרוג", frequency: 8507, transcription: "йеhарог", translation: "убьёт" },
  { hebrew: "נשוי", frequency: 8501, transcription: "насуй", translation: "женат" },
  { hebrew: "שבועיים", frequency: 8495, transcription: "швуайим", translation: "две недели" },
  { hebrew: "דו", frequency: 8487, transcription: "ду", translation: "Ду" },
  { hebrew: "הרצפה", frequency: 8484, transcription: "hарцпа", translation: "пол" },
  { hebrew: "ארה", frequency: 8477, transcription: "ара", translation: "Ара" },
  { hebrew: "תקשיבו", frequency: 8470, transcription: "тикшиву", translation: "слушайте" },
  { hebrew: "הקבוצה", frequency: 8456, transcription: "hаквуца", translation: "группа" },
  { hebrew: "מסיבת", frequency: 8455, transcription: "месибат", translation: "вечеринка" },
  { hebrew: "תגיע", frequency: 8447, transcription: "тагиа", translation: "придёшь" },
  { hebrew: "השגת", frequency: 8445, transcription: "hасагта", translation: "ты достиг" },
  { hebrew: "דיברת", frequency: 8435, transcription: "дибарта", translation: "ты говорил" },
  { hebrew: "זהב", frequency: 8432, transcription: "захав", translation: "золото" },
  { hebrew: "תסלח", frequency: 8429, transcription: "тислах", translation: "простишь" },
  { hebrew: "מחבב", frequency: 8424, transcription: "мехабев", translation: "симпатизирует" },
  { hebrew: "הלכת", frequency: 8418, transcription: "hалахта", translation: "ты ушёл" },
  { hebrew: "שומעת", frequency: 8415, transcription: "шомаат", translation: "слышит" },
  { hebrew: "אפשרות", frequency: 8415, transcription: "эфшарут", translation: "возможность" },
  { hebrew: "ארד", frequency: 8413, transcription: "арад", translation: "Арад" },
  { hebrew: "להרים", frequency: 8405, transcription: "леhарим", translation: "поднять" },
  { hebrew: "מק", frequency: 8400, transcription: "мек", translation: "Мек" },
  { hebrew: "הפשע", frequency: 8397, transcription: "hапеша", translation: "преступление" },
  { hebrew: "בדיקת", frequency: 8389, transcription: "бдикат", translation: "проверка" },
  { hebrew: "קולונל", frequency: 8382, transcription: "колонель", translation: "полковник" },
  { hebrew: "קניתי", frequency: 8375, transcription: "канити", translation: "я купил" },
  { hebrew: "חברות", frequency: 8373, transcription: "хаверот", translation: "подруги" },
  { hebrew: "בסכנה", frequency: 8365, transcription: "бесакана", translation: "в опасности" },
  { hebrew: "הרגשה", frequency: 8355, transcription: "hаргаша", translation: "чувство" },
  { hebrew: "הגנה", frequency: 8354, transcription: "hагана", translation: "защита" }
];

// Generate flashcards
const flashcards = data.map((item, index) => {
  const id = 1801 + index;
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
fs.writeFileSync('frontend/src/data/flashcards1801-1900.json', output);

console.log(`Generated ${flashcards.length} flashcards with IDs 1801-1900`);
console.log('Sample frequencies:');
flashcards.slice(0, 5).forEach(card => {
  console.log(`${card.id}: ${card.hebrew} -> ${card.frequency}`);
}); 