const fs = require('fs');

// Data from he_50k.txt lines 1901-2000 with transcriptions and translations
const data = [
  { hebrew: "לצד", frequency: 8348, transcription: "лецад", translation: "рядом с" },
  { hebrew: "הלבן", frequency: 8347, transcription: "hалаван", translation: "белый" },
  { hebrew: "המנהל", frequency: 8336, transcription: "hаменахель", translation: "директор" },
  { hebrew: "ארוכה", frequency: 8333, transcription: "арука", translation: "длинная" },
  { hebrew: "שמת", frequency: 8333, transcription: "самта", translation: "положила" },
  { hebrew: "חיות", frequency: 8327, transcription: "хайот", translation: "животные" },
  { hebrew: "שכבר", frequency: 8325, transcription: "шеквар", translation: "уже" },
  { hebrew: "המשרד", frequency: 8325, transcription: "hамишрад", translation: "офис" },
  { hebrew: "אשמתי", frequency: 8317, transcription: "ашмати", translation: "моя вина" },
  { hebrew: "נסה", frequency: 8315, transcription: "наса", translation: "попробовал" },
  { hebrew: "האדמה", frequency: 8314, transcription: "hаадама", translation: "земля" },
  { hebrew: "נמוך", frequency: 8312, transcription: "намух", translation: "низкий" },
  { hebrew: "לקחו", frequency: 8309, transcription: "лакху", translation: "взяли" },
  { hebrew: "בגיל", frequency: 8307, transcription: "багиль", translation: "в возрасте" },
  { hebrew: "מחכים", frequency: 8300, transcription: "мехаким", translation: "ждут" },
  { hebrew: "ההולדת", frequency: 8298, transcription: "hаhоледет", translation: "рождение" },
  { hebrew: "רעה", frequency: 8296, transcription: "раа", translation: "зло" },
  { hebrew: "הגברים", frequency: 8286, transcription: "hагварим", translation: "мужчины" },
  { hebrew: "קיבלנו", frequency: 8285, transcription: "кибальну", translation: "мы получили" },
  { hebrew: "איי", frequency: 8285, transcription: "ай", translation: "Ай" },
  { hebrew: "אצלך", frequency: 8272, transcription: "эцлеха", translation: "у тебя" },
  { hebrew: "להירגע", frequency: 8270, transcription: "леhирага", translation: "успокоиться" },
  { hebrew: "תיזהר", frequency: 8269, transcription: "тизахер", translation: "будь осторожен" },
  { hebrew: "פרופסור", frequency: 8262, transcription: "професор", translation: "профессор" },
  { hebrew: "אום", frequency: 8261, transcription: "ум", translation: "Ум" },
  { hebrew: "טיפול", frequency: 8256, transcription: "типуль", translation: "лечение" },
  { hebrew: "לזכור", frequency: 8253, transcription: "лизкор", translation: "помнить" },
  { hebrew: "שלישי", frequency: 8239, transcription: "шлиши", translation: "третий" },
  { hebrew: "סיפרה", frequency: 8222, transcription: "сифра", translation: "рассказала" },
  { hebrew: "מדהימה", frequency: 8221, transcription: "мадхима", translation: "удивительная" },
  { hebrew: "כלשהי", frequency: 8216, transcription: "кальшеи", translation: "какой-либо" },
  { hebrew: "לאחור", frequency: 8213, transcription: "леахор", translation: "назад" },
  { hebrew: "ובכל", frequency: 8212, transcription: "увехоль", translation: "и во всех" },
  { hebrew: "בהתחלה", frequency: 8195, transcription: "баhатхала", translation: "в начале" },
  { hebrew: "מאושרת", frequency: 8190, transcription: "меушерет", translation: "счастливая" },
  { hebrew: "הדירה", frequency: 8182, transcription: "hадира", translation: "квартира" },
  { hebrew: "ואף", frequency: 8180, transcription: "вааф", translation: "и даже" },
  { hebrew: "בנוסף", frequency: 8177, transcription: "беносаф", translation: "вдобавок" },
  { hebrew: "בתיק", frequency: 8166, transcription: "батик", translation: "в сумке" },
  { hebrew: "שאל", frequency: 8158, transcription: "шааль", translation: "спросил" },
  { hebrew: "גנרל", frequency: 8150, transcription: "генерал", translation: "генерал" },
  { hebrew: "מכתב", frequency: 8148, transcription: "михтав", translation: "письмо" },
  { hebrew: "ליסה", frequency: 8147, transcription: "лиса", translation: "Лиза" },
  { hebrew: "דולרים", frequency: 8146, transcription: "доларим", translation: "доллары" },
  { hebrew: "הברית", frequency: 8138, transcription: "hабрит", translation: "союз" },
  { hebrew: "ולמה", frequency: 8137, transcription: "валама", translation: "и почему" },
  { hebrew: "יקירי", frequency: 8135, transcription: "якири", translation: "дорогой" },
  { hebrew: "לעזרה", frequency: 8133, transcription: "леэзра", translation: "на помощь" },
  { hebrew: "החלטתי", frequency: 8120, transcription: "hехлатети", translation: "я решил" },
  { hebrew: "ריאן", frequency: 8115, transcription: "риан", translation: "Райан" },
  { hebrew: "לבין", frequency: 8114, transcription: "левейн", translation: "между" },
  { hebrew: "לגעת", frequency: 8099, transcription: "лагаат", translation: "трогать" },
  { hebrew: "מבית", frequency: 8098, transcription: "мибайт", translation: "из дома" },
  { hebrew: "לנהל", frequency: 8095, transcription: "ленахель", translation: "управлять" },
  { hebrew: "צרות", frequency: 8094, transcription: "царот", translation: "проблемы" },
  { hebrew: "איום", frequency: 8093, transcription: "айом", translation: "угроза" },
  { hebrew: "כלפי", frequency: 8090, transcription: "клапей", translation: "по отношению к" },
  { hebrew: "ימין", frequency: 8088, transcription: "ямин", translation: "право" },
  { hebrew: "לחיי", frequency: 8088, transcription: "лехаей", translation: "за жизнь" },
  { hebrew: "דה", frequency: 8084, transcription: "де", translation: "Де" },
  { hebrew: "הישן", frequency: 8070, transcription: "hаяшан", translation: "старый" },
  { hebrew: "נורה", frequency: 8068, transcription: "нора", translation: "лампа" },
  { hebrew: "בעיקר", frequency: 8059, transcription: "беикар", translation: "в основном" },
  { hebrew: "שמשהו", frequency: 8056, transcription: "шемашеу", translation: "что-то" },
  { hebrew: "דואג", frequency: 8045, transcription: "дуэг", translation: "беспокоится" },
  { hebrew: "נהרג", frequency: 8036, transcription: "неhераг", translation: "убит" },
  { hebrew: "ושוב", frequency: 8026, transcription: "вешув", translation: "и снова" },
  { hebrew: "פחד", frequency: 8025, transcription: "пахад", translation: "страх" },
  { hebrew: "גרה", frequency: 8017, transcription: "гара", translation: "живет" },
  { hebrew: "לילי", frequency: 8012, transcription: "лили", translation: "Лили" },
  { hebrew: "להציג", frequency: 8004, transcription: "лехациг", translation: "представить" },
  { hebrew: "פרי", frequency: 8003, transcription: "при", translation: "фрукт" },
  { hebrew: "נתנו", frequency: 7997, transcription: "натну", translation: "дали" },
  { hebrew: "השוטרים", frequency: 7989, transcription: "hашотрим", translation: "полицейские" },
  { hebrew: "הבגדים", frequency: 7987, transcription: "hабгадим", translation: "одежда" },
  { hebrew: "תוצא", frequency: 7986, transcription: "тоца", translation: "результат" },
  { hebrew: "מזהה", frequency: 7984, transcription: "мезахе", translation: "опознает" },
  { hebrew: "לעצמו", frequency: 7983, transcription: "леацмо", translation: "для себя" },
  { hebrew: "מחיר", frequency: 7974, transcription: "мехир", translation: "цена" },
  { hebrew: "תקווה", frequency: 7968, transcription: "тиква", translation: "надежда" },
  { hebrew: "כֵּן", frequency: 7953, transcription: "кен", translation: "да" },
  { hebrew: "תמות", frequency: 7953, transcription: "тамут", translation: "умрешь" },
  { hebrew: "בעד", frequency: 7953, transcription: "беад", translation: "за" },
  { hebrew: "נהנה", frequency: 7945, transcription: "неhене", translation: "наслаждается" },
  { hebrew: "אמילי", frequency: 7938, transcription: "эмили", translation: "Эмили" },
  { hebrew: "להן", frequency: 7925, transcription: "леhен", translation: "им" },
  { hebrew: "הקרב", frequency: 7925, transcription: "hакрав", translation: "битва" },
  { hebrew: "אחותך", frequency: 7911, transcription: "ахотха", translation: "твоя сестра" },
  { hebrew: "משטרת", frequency: 7908, transcription: "миштерет", translation: "полицейский" },
  { hebrew: "משלם", frequency: 7900, transcription: "мешалем", translation: "платит" },
  { hebrew: "נוסעים", frequency: 7900, transcription: "носаим", translation: "пассажиры" },
  { hebrew: "חום", frequency: 7889, transcription: "хом", translation: "жара" },
  { hebrew: "מטרה", frequency: 7887, transcription: "матара", translation: "цель" },
  { hebrew: "ללמד", frequency: 7884, transcription: "леламед", translation: "учить" },
  { hebrew: "ישנם", frequency: 7882, transcription: "ешнам", translation: "есть" },
  { hebrew: "האם", frequency: 7878, transcription: "hаим", translation: "ли" },
  { hebrew: "עיר", frequency: 7875, transcription: "ир", translation: "город" },
  { hebrew: "בימים", frequency: 7874, transcription: "баямим", translation: "в дни" },
  { hebrew: "השינה", frequency: 7874, transcription: "hашена", translation: "сон" }
];

// Generate flashcards
const flashcards = data.map((item, index) => {
  const id = 1901 + index;
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
fs.writeFileSync('frontend/src/data/flashcards1901-2000.json', output);

console.log(`Generated ${flashcards.length} flashcards with IDs 1901-2000`);
console.log('Sample frequencies:');
flashcards.slice(0, 5).forEach(card => {
  console.log(`${card.id}: ${card.hebrew} -> ${card.frequency}`);
}); 