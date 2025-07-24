const fs = require('fs');

// Data from he_50k.txt lines 2101-2200 with transcriptions and translations
const data = [
  { hebrew: "והייתי", frequency: 7455, transcription: "вэhаити", translation: "и был" },
  { hebrew: "ורק", frequency: 7454, transcription: "вэрак", translation: "и только" },
  { hebrew: "אבטחה", frequency: 7453, transcription: "автаха", translation: "охрана" },
  { hebrew: "נא", frequency: 7452, transcription: "на", translation: "пожалуйста" },
  { hebrew: "הבניין", frequency: 7452, transcription: "hабиньян", translation: "здание" },
  { hebrew: "שהכל", frequency: 7450, transcription: "шеhаколь", translation: "что всё" },
  { hebrew: "באיזו", frequency: 7448, transcription: "бэйзо", translation: "в какой" },
  { hebrew: "הצ", frequency: 7443, transcription: "hэц", translation: "совет" },
  { hebrew: "משפט", frequency: 7442, transcription: "мишпат", translation: "суд" },
  { hebrew: "ואתם", frequency: 7441, transcription: "вэатем", translation: "и вы" },
  { hebrew: "שניה", frequency: 7439, transcription: "шния", translation: "секунда" },
  { hebrew: "עזבה", frequency: 7438, transcription: "азва", translation: "оставила" },
  { hebrew: "העסקה", frequency: 7411, transcription: "hаиска", translation: "сделка" },
  { hebrew: "תשעה", frequency: 7405, transcription: "тишъа", translation: "девять" },
  { hebrew: "אבוא", frequency: 7404, transcription: "аво", translation: "я приду" },
  { hebrew: "ראשי", frequency: 7404, transcription: "раши", translation: "главный" },
  { hebrew: "שחט", frequency: 7402, transcription: "шахат", translation: "зарезал" },
  { hebrew: "כבודו", frequency: 7400, transcription: "кводу", translation: "ваша честь" },
  { hebrew: "יורד", frequency: 7397, transcription: "йоред", translation: "спускается" },
  { hebrew: "להסתיר", frequency: 7395, transcription: "леhастир", translation: "скрыть" },
  { hebrew: "למרבה", frequency: 7388, transcription: "лемарбе", translation: "к счастью" },
  { hebrew: "שיכולתי", frequency: 7384, transcription: "шиколти", translation: "я мог" },
  { hebrew: "מוח", frequency: 7384, transcription: "моах", translation: "мозг" },
  { hebrew: "לוח", frequency: 7382, transcription: "луах", translation: "доска" },
  { hebrew: "דודה", frequency: 7381, transcription: "дода", translation: "тётя" },
  { hebrew: "חזיר", frequency: 7374, transcription: "хазир", translation: "свинья" },
  { hebrew: "שנעשה", frequency: 7372, transcription: "шэнааса", translation: "что сделано" },
  { hebrew: "לאיש", frequency: 7372, transcription: "леиш", translation: "человеку" },
  { hebrew: "כבד", frequency: 7371, transcription: "кавед", translation: "тяжёлый" },
  { hebrew: "מקרים", frequency: 7370, transcription: "микрим", translation: "случаи" },
  { hebrew: "ביצים", frequency: 7370, transcription: "бэйцим", translation: "яйца" },
  { hebrew: "התכונית", frequency: 7367, transcription: "hатохнит", translation: "программа" },
  { hebrew: "בג", frequency: 7358, transcription: "баг", translation: "Баг" },
  { hebrew: "השתמש", frequency: 7356, transcription: "hиштамеш", translation: "использовал" },
  { hebrew: "נתנה", frequency: 7354, transcription: "натна", translation: "дала" },
  { hebrew: "מטפל", frequency: 7352, transcription: "метапель", translation: "опекун" },
  { hebrew: "המילים", frequency: 7351, transcription: "hамилим", translation: "слова" },
  { hebrew: "בעצמו", frequency: 7349, transcription: "беацмо", translation: "сам" },
  { hebrew: "שנעשה", frequency: 7346, transcription: "шэнааса", translation: "что сделано" },
  { hebrew: "קיומית", frequency: 7346, transcription: "киумит", translation: "существенная" },
  { hebrew: "ביד", frequency: 7345, transcription: "бьяд", translation: "в руке" },
  { hebrew: "אליסון", frequency: 7342, transcription: "элисон", translation: "Элисон" },
  { hebrew: "העבר", frequency: 7334, transcription: "hаавар", translation: "прошлое" },
  { hebrew: "איני", frequency: 7333, transcription: "эйни", translation: "я не" },
  { hebrew: "תפוס", frequency: 7320, transcription: "тафус", translation: "занят" },
  { hebrew: "פנוי", frequency: 7319, transcription: "пануй", translation: "свободный" },
  { hebrew: "הגברת", frequency: 7317, transcription: "hагверет", translation: "госпожа" },
  { hebrew: "יצאתי", frequency: 7311, transcription: "яцати", translation: "я вышел" },
  { hebrew: "לפתור", frequency: 7308, transcription: "лефтор", translation: "решить" },
  { hebrew: "שהיינו", frequency: 7303, transcription: "шеhаину", translation: "что мы были" },
  { hebrew: "איפשהו", frequency: 7299, transcription: "эйфошу", translation: "где-то" },
  { hebrew: "שוות", frequency: 7292, transcription: "шавот", translation: "равные" },
  { hebrew: "מצויין", frequency: 7291, transcription: "мецуян", translation: "отлично" },
  { hebrew: "יוכלו", frequency: 7288, transcription: "йухлу", translation: "смогут" },
  { hebrew: "תניח", frequency: 7287, transcription: "таних", translation: "положи" },
  { hebrew: "ארצה", frequency: 7285, transcription: "эрца", translation: "я хочу" },
  { hebrew: "הזקן", frequency: 7283, transcription: "hазакен", translation: "старик" },
  { hebrew: "להתנצל", frequency: 7281, transcription: "леhитнацель", translation: "извиниться" },
  { hebrew: "מריח", frequency: 7277, transcription: "мериах", translation: "пахнет" },
  { hebrew: "השוטף", frequency: 7275, transcription: "hашотеф", translation: "моющий" },
  { hebrew: "להתרחק", frequency: 7271, transcription: "леhитрахек", translation: "отдалиться" },
  { hebrew: "לאחד", frequency: 7264, transcription: "леахад", translation: "объединить" },
  { hebrew: "ימות", frequency: 7262, transcription: "ямут", translation: "умрет" },
  { hebrew: "לשרות", frequency: 7254, transcription: "лишрот", translation: "служить" },
  { hebrew: "שינויים", frequency: 7249, transcription: "шинуим", translation: "изменения" },
  { hebrew: "בעזרת", frequency: 7240, transcription: "беэзрат", translation: "с помощью" },
  { hebrew: "התמונות", frequency: 7229, transcription: "hатмунот", translation: "фотографии" },
  { hebrew: "נוספים", frequency: 7224, transcription: "носафим", translation: "дополнительные" },
  { hebrew: "שתדע", frequency: 7218, transcription: "шетеда", translation: "чтобы ты знал" },
  { hebrew: "תרגום", frequency: 7210, transcription: "таргум", translation: "перевод" },
  { hebrew: "מודע", frequency: 7210, transcription: "муда", translation: "осведомлен" },
  { hebrew: "אמך", frequency: 7203, transcription: "имха", translation: "твоя мама" },
  { hebrew: "דירה", frequency: 7195, transcription: "дира", translation: "квартира" },
  { hebrew: "קבוצת", frequency: 7191, transcription: "квудзат", translation: "группа" },
  { hebrew: "מקסים", frequency: 7174, transcription: "максим", translation: "Максим" },
  { hebrew: "חור", frequency: 7174, transcription: "хор", translation: "дыра" },
  { hebrew: "רומן", frequency: 7173, transcription: "роман", translation: "Роман" },
  { hebrew: "מזון", frequency: 7169, transcription: "мазон", translation: "еда" },
  { hebrew: "במלון", frequency: 7166, transcription: "бемалон", translation: "в отеле" },
  { hebrew: "סוד", frequency: 7166, transcription: "сод", translation: "секрет" },
  { hebrew: "ביטחון", frequency: 7163, transcription: "битахон", translation: "безопасность" },
  { hebrew: "שתמיד", frequency: 7162, transcription: "шетамид", translation: "всегда" },
  { hebrew: "איכשהו", frequency: 7159, transcription: "эйхшеhу", translation: "как-то" },
  { hebrew: "לשבור", frequency: 7155, transcription: "лишбор", translation: "сломать" },
  { hebrew: "you", frequency: 7145, transcription: "ю", translation: "you" },
  { hebrew: "השטין", frequency: 7144, transcription: "hаштин", translation: "Штин" },
  { hebrew: "טבעי", frequency: 7140, transcription: "тиви", translation: "естественный" },
  { hebrew: "בניו", frequency: 7140, transcription: "бенав", translation: "в его сыновьях" },
  { hebrew: "השבט", frequency: 7138, transcription: "hашевет", translation: "племя" },
  { hebrew: "משפחתי", frequency: 7135, transcription: "мишпахти", translation: "мой семейный" },
  { hebrew: "קרן", frequency: 7134, transcription: "керен", translation: "Керен" },
  { hebrew: "שנראה", frequency: 7132, transcription: "шенирэ", translation: "что видно" },
  { hebrew: "מפתחת", frequency: 7132, transcription: "мефатахат", translation: "развивает" },
  { hebrew: "שרציתי", frequency: 7127, transcription: "шерацити", translation: "что я хотел" },
  { hebrew: "נגיד", frequency: 7121, transcription: "нагид", translation: "скажем" },
  { hebrew: "השתנה", frequency: 7116, transcription: "hиштана", translation: "изменился" },
  { hebrew: "אביו", frequency: 7103, transcription: "авив", translation: "его отец" },
  { hebrew: "האחד", frequency: 7097, transcription: "hаахад", translation: "один" },
  { hebrew: "סיימנו", frequency: 7095, transcription: "сиямну", translation: "мы закончили" },
  { hebrew: "שכולנו", frequency: 7093, transcription: "шекулану", translation: "что все мы" }
];

// Generate flashcards
const flashcards = data.map((item, index) => {
  const id = 2101 + index;
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
fs.writeFileSync('frontend/src/data/flashcards2101-2200.json', output);

console.log(`Generated ${flashcards.length} flashcards with IDs 2101-2200`);
console.log('Sample frequencies:');
flashcards.slice(0, 5).forEach(card => {
  console.log(`${card.id}: ${card.hebrew} -> ${card.frequency}`);
}); 