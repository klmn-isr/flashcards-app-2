const fs = require('fs');

// Data from he_50k.txt lines 1601-1700 with transcriptions and translations
const data = [
  { hebrew: "פתוח", frequency: 10189, transcription: "патуах", translation: "открытый" },
  { hebrew: "גבירותיי", frequency: 10173, transcription: "гвиротай", translation: "дамы" },
  { hebrew: "סמל", frequency: 10164, transcription: "сэмэль", translation: "символ" },
  { hebrew: "השמש", frequency: 10155, transcription: "hашэмэш", translation: "солнце" },
  { hebrew: "שוטרים", frequency: 10153, transcription: "шотрим", translation: "полицейские" },
  { hebrew: "דלת", frequency: 10148, transcription: "дэлэт", translation: "дверь" },
  { hebrew: "למשרד", frequency: 10144, transcription: "ламишрад", translation: "в офис" },
  { hebrew: "בשום", frequency: 10137, transcription: "бэшум", translation: "ни в каком" },
  { hebrew: "מגיעים", frequency: 10131, transcription: "магиим", translation: "приходят" },
  { hebrew: "ואולי", frequency: 10130, transcription: "ваули", translation: "и может быть" },
  { hebrew: "העסק", frequency: 10127, transcription: "hаэсэк", translation: "бизнес" },
  { hebrew: "רכב", frequency: 10126, transcription: "рэхэв", translation: "машина" },
  { hebrew: "אליהם", frequency: 10121, transcription: "элэйhэм", translation: "к ним" },
  { hebrew: "דן", frequency: 10117, transcription: "дан", translation: "Дан" },
  { hebrew: "כולל", frequency: 10059, transcription: "кулэль", translation: "включая" },
  { hebrew: "אמצא", frequency: 10049, transcription: "эмца", translation: "я найду" },
  { hebrew: "הממ", frequency: 10037, transcription: "hамм", translation: "хмм" },
  { hebrew: "להזמין", frequency: 10036, transcription: "лэhазмин", translation: "пригласить" },
  { hebrew: "חמודה", frequency: 10028, transcription: "хамуда", translation: "милая" },
  { hebrew: "זהירות", frequency: 10026, transcription: "зэhирут", translation: "осторожность" },
  { hebrew: "דיברנו", frequency: 10013, transcription: "дибарну", translation: "мы говорили" },
  { hebrew: "אחרות", frequency: 10012, transcription: "ахрот", translation: "другие" },
  { hebrew: "לשחרר", frequency: 10010, transcription: "лашхэр", translation: "освободить" },
  { hebrew: "רעב", frequency: 9998, transcription: "раэв", translation: "голодный" },
  { hebrew: "מסוגלת", frequency: 9993, transcription: "мэсугэлэт", translation: "способна" },
  { hebrew: "תחזיק", frequency: 9985, transcription: "тахзик", translation: "держи" },
  { hebrew: "משקר", frequency: 9953, transcription: "мэшакэр", translation: "лжет" },
  { hebrew: "לאהוב", frequency: 9933, transcription: "лээhов", translation: "любить" },
  { hebrew: "עצמה", frequency: 9932, transcription: "ацма", translation: "сама" },
  { hebrew: "לעיר", frequency: 9924, transcription: "лаир", translation: "в город" },
  { hebrew: "ם", frequency: 9923, transcription: "мэм софит", translation: "мэм софит" },
  { hebrew: "שאי", frequency: 9916, transcription: "шай", translation: "Шай" },
  { hebrew: "שמתי", frequency: 9910, transcription: "самати", translation: "я положил" },
  { hebrew: "אד", frequency: 9907, transcription: "ад", translation: "Эд" },
  { hebrew: "שנתיים", frequency: 9906, transcription: "шнатайим", translation: "два года" },
  { hebrew: "חזקה", frequency: 9884, transcription: "хазка", translation: "сильная" },
  { hebrew: "סקוט", frequency: 9883, transcription: "скот", translation: "Скотт" },
  { hebrew: "חירום", frequency: 9879, transcription: "хирум", translation: "чрезвычайное положение" },
  { hebrew: "רבותיי", frequency: 9879, transcription: "равотай", translation: "господа" },
  { hebrew: "הגופה", frequency: 9868, transcription: "hагуфа", translation: "тело" },
  { hebrew: "התחלתי", frequency: 9862, transcription: "hитхалти", translation: "я начал" },
  { hebrew: "השיר", frequency: 9860, transcription: "hашир", translation: "песня" },
  { hebrew: "תספר", frequency: 9857, transcription: "таспар", translation: "расскажешь" },
  { hebrew: "מודה", frequency: 9848, transcription: "модэ", translation: "признаю" },
  { hebrew: "הרגת", frequency: 9837, transcription: "hарагта", translation: "ты убил" },
  { hebrew: "אחוז", frequency: 9836, transcription: "ахуз", translation: "процент" },
  { hebrew: "אחריו", frequency: 9835, transcription: "ахарав", translation: "после него" },
  { hebrew: "האש", frequency: 9831, transcription: "hаэш", translation: "огонь" },
  { hebrew: "איכפת", frequency: 9829, transcription: "эйхпат", translation: "заботиться" },
  { hebrew: "לאתר", frequency: 9813, transcription: "лаатар", translation: "найти" },
  { hebrew: "יראה", frequency: 9811, transcription: "йирэ", translation: "увидит" },
  { hebrew: "שכדאי", frequency: 9785, transcription: "шэкадэй", translation: "что стоит" },
  { hebrew: "המשימה", frequency: 9778, transcription: "hамишма", translation: "задача" },
  { hebrew: "נוסע", frequency: 9776, transcription: "носэа", translation: "пассажир" },
  { hebrew: "בלש", frequency: 9776, transcription: "балаш", translation: "детектив" },
  { hebrew: "לחבר", frequency: 9767, transcription: "лахэвэр", translation: "соединить" },
  { hebrew: "לזרוק", frequency: 9761, transcription: "лазрок", translation: "бросить" },
  { hebrew: "בעלך", frequency: 9724, transcription: "баалэх", translation: "твой муж" },
  { hebrew: "ניתוח", frequency: 9723, transcription: "нитуах", translation: "операция" },
  { hebrew: "לדעתי", frequency: 9720, transcription: "лэдаати", translation: "по моему мнению" },
  { hebrew: "אצלי", frequency: 9717, transcription: "эцли", translation: "у меня" },
  { hebrew: "לרקוד", frequency: 9708, transcription: "ларкод", translation: "танцевать" },
  { hebrew: "מוכרח", frequency: 9708, transcription: "мухрах", translation: "должен" },
  { hebrew: "הרוח", frequency: 9703, transcription: "hаруах", translation: "ветер" },
  { hebrew: "לשלוט", frequency: 9701, transcription: "лишлот", translation: "править" },
  { hebrew: "צעירה", frequency: 9697, transcription: "цаира", translation: "молодая" },
  { hebrew: "מעוניין", frequency: 9696, transcription: "мэуниан", translation: "заинтересован" },
  { hebrew: "מודאג", frequency: 9668, transcription: "мэдуаг", translation: "беспокоится" },
  { hebrew: "העתיד", frequency: 9665, transcription: "hаатид", translation: "будущее" },
  { hebrew: "דפוק", frequency: 9662, transcription: "дафук", translation: "сломанный" },
  { hebrew: "עץ", frequency: 9655, transcription: "эц", translation: "дерево" },
  { hebrew: "וכך", frequency: 9653, transcription: "вэках", translation: "и так" },
  { hebrew: "ועם", frequency: 9646, transcription: "вэим", translation: "и с" },
  { hebrew: "באמצעות", frequency: 9641, transcription: "бээмцаут", translation: "с помощью" },
  { hebrew: "פרטי", frequency: 9625, transcription: "прати", translation: "частный" },
  { hebrew: "מפשע", frequency: 9622, transcription: "мэфэша", translation: "преступление" },
  { hebrew: "לשכנע", frequency: 9621, transcription: "лашкнэа", translation: "убедить" },
  { hebrew: "בינתיים", frequency: 9618, transcription: "бэйнтаим", translation: "пока" },
  { hebrew: "תאונה", frequency: 9617, transcription: "тауна", translation: "авария" },
  { hebrew: "ואיך", frequency: 9616, transcription: "вээйх", translation: "и как" },
  { hebrew: "תיתן", frequency: 9600, transcription: "титэн", translation: "дашь" },
  { hebrew: "במשהו", frequency: 9595, transcription: "бэмашэhу", translation: "в чем-то" },
  { hebrew: "בגדים", frequency: 9590, transcription: "бгадим", translation: "одежда" },
  { hebrew: "דון", frequency: 9587, transcription: "дон", translation: "Дон" },
  { hebrew: "אינה", frequency: 9574, transcription: "эйна", translation: "не" },
  { hebrew: "אחריי", frequency: 9573, transcription: "ахарай", translation: "после меня" },
  { hebrew: "חודש", frequency: 9567, transcription: "ходэш", translation: "месяц" },
  { hebrew: "עוף", frequency: 9565, transcription: "оф", translation: "курица" },
  { hebrew: "האור", frequency: 9558, transcription: "hаор", translation: "свет" },
  { hebrew: "תפסתי", frequency: 9557, transcription: "тафасти", translation: "я поймал" },
  { hebrew: "i", frequency: 9556, transcription: "ай", translation: "я" },
  { hebrew: "בריאן", frequency: 9552, transcription: "бриан", translation: "Брайан" },
  { hebrew: "שהן", frequency: 9547, transcription: "шэhэн", translation: "что они" },
  { hebrew: "אישור", frequency: 9546, transcription: "ишур", translation: "разрешение" },
  { hebrew: "חלום", frequency: 9543, transcription: "халом", translation: "сон" },
  { hebrew: "מבטיחה", frequency: 9543, transcription: "мэвтиха", translation: "обещаю" },
  { hebrew: "תכנית", frequency: 9539, transcription: "тохнит", translation: "план" },
  { hebrew: "אמריקה", frequency: 9536, transcription: "амэрика", translation: "Америка" },
  { hebrew: "לנקות", frequency: 9527, transcription: "ланкот", translation: "чистить" },
  { hebrew: "אהרוג", frequency: 9520, transcription: "ахрог", translation: "я убью" }
];

// Generate flashcards
const flashcards = data.map((item, index) => {
  const id = 1601 + index;
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
fs.writeFileSync('frontend/src/data/flashcards1601-1700.json', output);

console.log(`Generated ${flashcards.length} flashcards with IDs 1601-1700`);
console.log('Sample frequencies:');
flashcards.slice(0, 5).forEach(card => {
  console.log(`${card.id}: ${card.hebrew} -> ${card.frequency}`);
}); 