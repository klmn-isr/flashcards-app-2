const fs = require('fs');

// Data from he_50k.txt lines 1701-1800 with transcriptions and translations
const data = [
  { hebrew: "קרא", frequency: 9517, transcription: "кара", translation: "читал" },
  { hebrew: "נכנסת", frequency: 9515, transcription: "нихнэсэт", translation: "вошла" },
  { hebrew: "הצליח", frequency: 9509, transcription: "hицлиах", translation: "преуспел" },
  { hebrew: "צריכות", frequency: 9498, transcription: "црихот", translation: "нужны" },
  { hebrew: "ביקש", frequency: 9489, transcription: "бикэш", translation: "просил" },
  { hebrew: "ניסיון", frequency: 9489, transcription: "нисион", translation: "опыт" },
  { hebrew: "רוברט", frequency: 9473, transcription: "роберт", translation: "Роберт" },
  { hebrew: "שותה", frequency: 9472, transcription: "шотэ", translation: "пьет" },
  { hebrew: "רגל", frequency: 9471, transcription: "рэгэль", translation: "нога" },
  { hebrew: "יומיים", frequency: 9468, transcription: "йомаим", translation: "два дня" },
  { hebrew: "שעברה", frequency: 9461, transcription: "шэавра", translation: "что прошла" },
  { hebrew: "לוותר", frequency: 9461, transcription: "лавтор", translation: "отказаться" },
  { hebrew: "לפנות", frequency: 9445, transcription: "лифнот", translation: "обращаться" },
  { hebrew: "נצא", frequency: 9439, transcription: "ницэ", translation: "выйдем" },
  { hebrew: "מתחילה", frequency: 9439, transcription: "митхила", translation: "начинаю" },
  { hebrew: "ניקח", frequency: 9437, transcription: "никах", translation: "возьмем" },
  { hebrew: "התפקיד", frequency: 9435, transcription: "hатафкид", translation: "роль" },
  { hebrew: "להיפגש", frequency: 9426, transcription: "лэhипагэш", translation: "встретиться" },
  { hebrew: "טרי", frequency: 9423, transcription: "тари", translation: "свежий" },
  { hebrew: "בתחת", frequency: 9406, transcription: "батахт", translation: "в заднице" },
  { hebrew: "לוק", frequency: 9401, transcription: "лук", translation: "Лук" },
  { hebrew: "פשע", frequency: 9393, transcription: "пэша", translation: "преступление" },
  { hebrew: "גנב", frequency: 9393, transcription: "ганнав", translation: "вор" },
  { hebrew: "מסתבר", frequency: 9383, transcription: "миставэр", translation: "оказывается" },
  { hebrew: "גבירתי", frequency: 9366, transcription: "гвирати", translation: "моя госпожа" },
  { hebrew: "חוק", frequency: 9365, transcription: "хук", translation: "закон" },
  { hebrew: "מחפשת", frequency: 9361, transcription: "мэхапэсэт", translation: "ищет" },
  { hebrew: "למשהו", frequency: 9355, transcription: "лэмашэhу", translation: "к чему-то" },
  { hebrew: "הבאת", frequency: 9350, transcription: "hэвэт", translation: "принесла" },
  { hebrew: "ראיות", frequency: 9350, transcription: "раайот", translation: "доказательства" },
  { hebrew: "וזו", frequency: 9348, transcription: "вэзот", translation: "и это" },
  { hebrew: "מכה", frequency: 9346, transcription: "мака", translation: "удар" },
  { hebrew: "הפך", frequency: 9333, transcription: "hафах", translation: "перевернул" },
  { hebrew: "עברו", frequency: 9333, transcription: "авру", translation: "прошли" },
  { hebrew: "קלי", frequency: 9324, transcription: "кали", translation: "Кали" },
  { hebrew: "אמה", frequency: 9317, transcription: "има", translation: "мама" },
  { hebrew: "החלטה", frequency: 9317, transcription: "hахлата", translation: "решение" },
  { hebrew: "מטר", frequency: 9315, transcription: "мэтэр", translation: "метр" },
  { hebrew: "וולטר", frequency: 9305, transcription: "волтэр", translation: "Уолтер" },
  { hebrew: "שאלתי", frequency: 9303, transcription: "шаалти", translation: "я спросил" },
  { hebrew: "נהג", frequency: 9300, transcription: "наhаг", translation: "водитель" },
  { hebrew: "אטפל", frequency: 9295, transcription: "этпал", translation: "я займусь" },
  { hebrew: "פיט", frequency: 9279, transcription: "пит", translation: "Пит" },
  { hebrew: "אשם", frequency: 9253, transcription: "ашам", translation: "виновен" },
  { hebrew: "קיים", frequency: 9252, transcription: "кайам", translation: "существует" },
  { hebrew: "שבאת", frequency: 9251, transcription: "шэвата", translation: "что пришла" },
  { hebrew: "שחשבתי", frequency: 9247, transcription: "шэхашавти", translation: "что думал" },
  { hebrew: "ואי", frequency: 9236, transcription: "ваай", translation: "и нет" },
  { hebrew: "ממשיך", frequency: 9218, transcription: "мамших", translation: "продолжает" },
  { hebrew: "לשכוח", frequency: 9209, transcription: "лишкоах", translation: "забыть" },
  { hebrew: "עשרים", frequency: 9208, transcription: "эсрим", translation: "двадцать" },
  { hebrew: "נחזור", frequency: 9195, transcription: "нахзор", translation: "вернемся" },
  { hebrew: "התקשרתי", frequency: 9190, transcription: "hиткашарти", translation: "я позвонил" },
  { hebrew: "קלייר", frequency: 9189, transcription: "клайр", translation: "Клэр" },
  { hebrew: "מזמן", frequency: 9156, transcription: "мизман", translation: "давно" },
  { hebrew: "תה", frequency: 9152, transcription: "тэ", translation: "чай" },
  { hebrew: "תשומת", frequency: 9150, transcription: "тсумат", translation: "внимание" },
  { hebrew: "הקול", frequency: 9147, transcription: "hаколь", translation: "голос" },
  { hebrew: "ביקשתי", frequency: 9133, transcription: "бикэшти", translation: "я просил" },
  { hebrew: "לכיוון", frequency: 9130, transcription: "лакивун", translation: "к направлению" },
  { hebrew: "הבחורים", frequency: 9127, transcription: "hабахурим", translation: "парни" },
  { hebrew: "בשבילו", frequency: 9126, transcription: "бишвило", translation: "для него" },
  { hebrew: "הצד", frequency: 9126, transcription: "hацад", translation: "сторона" },
  { hebrew: "למשך", frequency: 9125, transcription: "ламишэх", translation: "на протяжении" },
  { hebrew: "אנה", frequency: 9110, transcription: "ана", translation: "Анна" },
  { hebrew: "ומי", frequency: 9094, transcription: "вэми", translation: "и кто" },
  { hebrew: "משרד", frequency: 9088, transcription: "мишрад", translation: "офис" },
  { hebrew: "הקודמים", frequency: 9084, transcription: "hакудмим", translation: "предыдущие" },
  { hebrew: "מאט", frequency: 9074, transcription: "мат", translation: "Мэтт" },
  { hebrew: "תבוא", frequency: 9059, transcription: "таво", translation: "придешь" },
  { hebrew: "שתרצה", frequency: 9059, transcription: "шэтирцэ", translation: "что захочешь" },
  { hebrew: "הגבר", frequency: 9038, transcription: "hагавэр", translation: "мужчина" },
  { hebrew: "במרחק", frequency: 9029, transcription: "бэмархэк", translation: "на расстоянии" },
  { hebrew: "ליום", frequency: 9028, transcription: "лайом", translation: "к дню" },
  { hebrew: "התשובה", frequency: 9023, transcription: "hативуа", translation: "ответ" },
  { hebrew: "בידי", frequency: 9015, transcription: "бэядай", translation: "в моих руках" },
  { hebrew: "שהייתה", frequency: 9010, transcription: "шэhайта", translation: "что была" },
  { hebrew: "הביא", frequency: 8994, transcription: "hэви", translation: "принес" },
  { hebrew: "כשאת", frequency: 8990, transcription: "кэшат", translation: "когда ты" },
  { hebrew: "מתגעגע", frequency: 8988, transcription: "митгаага", translation: "скучает" },
  { hebrew: "עברתי", frequency: 8988, transcription: "авэрти", translation: "я прошел" },
  { hebrew: "מאמינים", frequency: 8970, transcription: "мааминим", translation: "верят" },
  { hebrew: "מקבלת", frequency: 8966, transcription: "мэкабэлэт", translation: "получает" },
  { hebrew: "ואן", frequency: 8965, transcription: "ван", translation: "Ван" },
  { hebrew: "הרגתי", frequency: 8965, transcription: "hарагти", translation: "я убил" },
  { hebrew: "קייל", frequency: 8962, transcription: "кайл", translation: "Кайл" },
  { hebrew: "שאעשה", frequency: 8958, transcription: "шэээсэ", translation: "что сделаю" },
  { hebrew: "עתה", frequency: 8957, transcription: "ата", translation: "теперь" },
  { hebrew: "שלם", frequency: 8955, transcription: "шалэм", translation: "целый" },
  { hebrew: "מקשיב", frequency: 8951, transcription: "макшив", translation: "слушает" },
  { hebrew: "תתחיל", frequency: 8949, transcription: "татхиль", translation: "начнешь" },
  { hebrew: "ערך", frequency: 8936, transcription: "эрэх", translation: "значение" },
  { hebrew: "ענק", frequency: 8932, transcription: "анак", translation: "гигант" },
  { hebrew: "חשבון", frequency: 8925, transcription: "хэшбон", translation: "счет" },
  { hebrew: "יקר", frequency: 8906, transcription: "якар", translation: "дорогой" },
  { hebrew: "חברת", frequency: 8901, transcription: "хавэрат", translation: "компания" },
  { hebrew: "שבי", frequency: 8892, transcription: "шэби", translation: "что я" },
  { hebrew: "החתונה", frequency: 8883, transcription: "hахатуна", translation: "свадьба" },
  { hebrew: "ללבוש", frequency: 8870, transcription: "лилбош", translation: "одеваться" },
  { hebrew: "קרובים", frequency: 8870, transcription: "кровим", translation: "родственники" }
];

// Generate flashcards
const flashcards = data.map((item, index) => {
  const id = 1701 + index;
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
fs.writeFileSync('frontend/src/data/flashcards1701-1800.json', output);

console.log(`Generated ${flashcards.length} flashcards with IDs 1701-1800`);
console.log('Sample frequencies:');
flashcards.slice(0, 5).forEach(card => {
  console.log(`${card.id}: ${card.hebrew} -> ${card.frequency}`);
}); 