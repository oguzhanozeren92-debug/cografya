import type { Language } from './i18nStrings';

// Canonical place names are shared by all game modes. Never translate score keys,
// answer values or country IDs: only the labels rendered to the player.
const englishCapitals:Record<string,string>={
  'Kabil':'Kabul','Tiran':'Tirana','Cezayir':'Algiers','Luanda':'Luanda',
  'Bakü':'Baku','Tiran':'Tirana','Brasilya':'Brasília','Viyana':'Vienna',
  'Dakka':'Dhaka','Erivan':'Yerevan','Brüksel':'Brussels','Thimbu':'Thimphu',
  'Saraybosna':'Sarajevo','Sofya':'Sofia','Encemine':"N'Djamena",
  'Librevil':'Libreville','Lome':'Lomé','Konakri':'Conakry',
  'Hartum':'Khartoum','Cibuti':'Djibouti','Akra':'Accra','Kinşasa':'Kinshasa',
  'Brazavil':'Brazzaville','Pekin':'Beijing','Kahire':'Cairo',
  'Bogota':'Bogotá','Meksiko':'Mexico City','Moskova':'Moscow',
  'Atina':'Athens','Londra':'London','Roma':'Rome','Paris':'Paris',
  'Yeni Delhi':'New Delhi','Seul':'Seoul','Tokyo':'Tokyo',
  'Washington DC':'Washington, D.C.','Washington, DC':'Washington, D.C.',
  'İslamabad':'Islamabad','İstanbul':'Istanbul','Tiflis':'Tbilisi',
  'Bükreş':'Bucharest','Budapeşte':'Budapest','Prag':'Prague',
  'Varşova':'Warsaw','Kopenhag':'Copenhagen','Helsinki':'Helsinki',
  'Stokholm':'Stockholm','Stockholm':'Stockholm','Kişinev':'Chișinău',
  'Podgoritsa':'Podgorica','Podgorica':'Podgorica',
  'Kudüs':'Jerusalem','Tahran':'Tehran','Bağdat':'Baghdad',
  'Er-Riyad':'Riyadh','Riyad':'Riyadh','Maskat':'Muscat','Amman':'Amman',
  'Abu Dabi':'Abu Dhabi','Kuveyt':'Kuwait City','Beyrut':'Beirut',
  'Katmandu':'Kathmandu','Kuala Lumpur':'Kuala Lumpur','Cakarta':'Jakarta',
  'Hanoi':'Hanoi','Manila':'Manila','Bangkok':'Bangkok','Pnom Pen':'Phnom Penh',
  'Phnom Penh':'Phnom Penh','Bandar Seri Begavan':'Bandar Seri Begawan',
  'Sucre':'Sucre','Santiago':'Santiago','Montevideo':'Montevideo',
  'Buenos Aires':'Buenos Aires','Karakas':'Caracas',
  'Lima':'Lima','Panama':'Panama City','Asunción':'Asunción',
  'San Hose':'San José','San José':'San José','Maseru':'Maseru',
  'Maputo':'Maputo','Nuakşot':'Nouakchott','Lilongve':'Lilongwe',
  'Windhoek':'Windhoek','Nairobi':'Nairobi','Abuja':'Abuja',
  'Addis Ababa':'Addis Ababa','Gaborone':'Gaborone',
  'Gitega':'Gitega','Banjul':'Banjul','Bamako':'Bamako',
  'Niamey':'Niamey','Kigali':'Kigali','Harare':'Harare',
  'Wellington':'Wellington','Canberra':'Canberra','Port Vila':'Port Vila',
  'Reykjavik':'Reykjavík','Vilnius':'Vilnius','Tallinn':'Tallinn',
  'Riga':'Riga','Bişkek':'Bishkek','Ulan Batur':'Ulaanbaatar',
  'Almatı':'Almaty','Astana':'Astana','Dublin':'Dublin',
  'Bratislava':'Bratislava','Amsterdam':'Amsterdam',
  'Lüksemburg':'Luxembourg','Lefkoşa':'Nicosia',
  'Büyük Britanya':'London','Belgrad':'Belgrade','Zagreb':'Zagreb',
  'Tiran':'Tirana','Bişkek':'Bishkek','Belmopan':'Belmopan',
  'Georgetown':'Georgetown','Port of Spain':'Port of Spain',
  'Kalküta':'Kolkata','Honiara':'Honiara',
};
const localeCapitals:Partial<Record<Language,Record<string,string>>>={
  de:{London:'London',Beijing:'Peking',Rome:'Rom',Moscow:'Moskau',Prague:'Prag',Athens:'Athen',Warsaw:'Warschau',Vienna:'Wien',Copenhagen:'Kopenhagen',Cairo:'Kairo',Brussels:'Brüssel'},
  es:{London:'Londres',Beijing:'Pekín',Rome:'Roma',Moscow:'Moscú',Prague:'Praga',Athens:'Atenas',Vienna:'Viena',Copenhagen:'Copenhague',Cairo:'El Cairo',Brussels:'Bruselas',Lisbon:'Lisboa'},
  fr:{London:'Londres',Beijing:'Pékin',Rome:'Rome',Moscow:'Moscou',Prague:'Prague',Athens:'Athènes',Vienna:'Vienne',Copenhagen:'Copenhague',Cairo:'Le Caire',Brussels:'Bruxelles'},
  pt:{London:'Londres',Beijing:'Pequim',Rome:'Roma',Moscow:'Moscou',Prague:'Praga',Athens:'Atenas',Vienna:'Viena',Copenhagen:'Copenhague',Cairo:'Cairo',Brussels:'Bruxelas'},
  ru:{London:'Лондон',Beijing:'Пекин',Rome:'Рим',Moscow:'Москва',Prague:'Прага',Athens:'Афины',Vienna:'Вена',Tokyo:'Токио',Cairo:'Каир',Berlin:'Берлин',Paris:'Париж',Madrid:'Мадрид',Ankara:'Анкара',Seoul:'Сеул',Baku:'Баку',Tbilisi:'Тбилиси'},
  zh:{London:'伦敦',Beijing:'北京',Rome:'罗马',Moscow:'莫斯科',Prague:'布拉格',Athens:'雅典',Vienna:'维也纳',Tokyo:'东京',Cairo:'开罗',Berlin:'柏林',Paris:'巴黎',Madrid:'马德里',Ankara:'安卡拉',Seoul:'首尔',Baku:'巴库',Tbilisi:'第比利斯',Washington:'华盛顿'},
  ja:{London:'ロンドン',Beijing:'北京',Rome:'ローマ',Moscow:'モスクワ',Prague:'プラハ',Athens:'アテネ',Vienna:'ウィーン',Tokyo:'東京',Cairo:'カイロ',Berlin:'ベルリン',Paris:'パリ',Madrid:'マドリード',Ankara:'アンカラ',Seoul:'ソウル',Baku:'バクー',Tbilisi:'トビリシ',Washington:'ワシントンD.C.'},
};
export function localizedCapitalName(turkishName:string,language:Language):string{
  if(language==='tr')return turkishName;
  const name=englishCapitals[turkishName]??turkishName;
  return localeCapitals[language]?.[name]??name;
}
