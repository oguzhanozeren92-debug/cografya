import type { Difficulty } from '@/types';

/**
 * Hand-curated factual clues for Atlas Arena. The country name is NEVER sent
 * to the player before answering. Three increasingly direct hints per card.
 * Each ID is a valid geography country key; the final fact appears after
 * answering. Expand this catalog only with reviewed geographic facts.
 */
export interface CountryClueCard {
  countryId: string;
  difficulty: Difficulty;
  clues: readonly [string, string, string];
  fact: string;
  sourceUrl?: string;
}

const cards: CountryClueCard[] = [
  {
    "countryId": "792",
    "difficulty": 1,
    "clues": [
      "İki kıtayı birbirine bağlayan ünlü bir boğazı vardır.",
      "Kapadokya'daki peribacalarıyla tanınır.",
      "Başkentinin adı Ankara'dır."
    ],
    "fact": "İstanbul Boğazı Avrupa ve Asya arasında uzanır."
  },
  {
    "countryId": "392",
    "difficulty": 1,
    "clues": [
      "Fuji Dağı ülkenin en bilinen simgelerindendir.",
      "Kiraz çiçeği mevsimiyle ünlüdür.",
      "Başkentinin adı Tokyo'dur."
    ],
    "fact": "Bu ülke Doğu Asya'da bir ada devletidir."
  },
  {
    "countryId": "076",
    "difficulty": 1,
    "clues": [
      "Amazon yağmur ormanlarının büyük bir bölümü buradadır.",
      "Rio de Janeiro'daki Kurtarıcı İsa heykeli simgesidir.",
      "Güney Amerika'da resmî dili Portekizce olan büyük ülkedir."
    ],
    "fact": "Amazon Nehri havzası çok sayıda bitki ve hayvan türüne ev sahipliği yapar."
  },
  {
    "countryId": "250",
    "difficulty": 1,
    "clues": [
      "Louvre Müzesi burada bulunur.",
      "Eyfel Kulesi en bilinen simgelerindendir.",
      "Başkentinin adı Paris'tir."
    ],
    "fact": "Avrupa'nın batısında yer alır ve Akdeniz'e kıyısı vardır."
  },
  {
    "countryId": "818",
    "difficulty": 1,
    "clues": [
      "Antik piramitleriyle dünya çapında tanınır.",
      "Nil Nehri bu ülkenin içinden geçer.",
      "Başkentinin adı Kahire'dir."
    ],
    "fact": "Gize Piramitleri bu ülkenin kuzeyinde yer alır."
  },
  {
    "countryId": "840",
    "difficulty": 1,
    "clues": [
      "Büyük Kanyon burada yer alır.",
      "50 eyaletten oluşan federal bir ülkedir.",
      "Başkentinin adı Washington, DC'dir."
    ],
    "fact": "Büyük Kanyon, Arizona eyaletindedir."
  },
  {
    "countryId": "036",
    "difficulty": 1,
    "clues": [
      "Kanguru ve koalalarıyla tanınır.",
      "Büyük Set Resifi kıyıları yakınındadır.",
      "Başkentinin adı Canberra'dır."
    ],
    "fact": "Dünya üzerindeki en büyük mercan resif sistemlerinden biri buradadır."
  },
  {
    "countryId": "124",
    "difficulty": 1,
    "clues": [
      "Akçaağaç yaprağı ülkenin simgesidir.",
      "Çok sayıda göl ve geniş ormanlara sahiptir.",
      "Başkentinin adı Ottawa'dır."
    ],
    "fact": "Yüzölçümü bakımından dünyanın en büyük ülkelerinden biridir."
  },
  {
    "countryId": "380",
    "difficulty": 1,
    "clues": [
      "Haritada çizme biçimine benzeyen bir yarımadadadır.",
      "Kolezyum ve Venedik kanallarıyla tanınır.",
      "Başkentinin adı Roma'dır."
    ],
    "fact": "Antik Roma uygarlığının merkezidir."
  },
  {
    "countryId": "156",
    "difficulty": 1,
    "clues": [
      "Dünyaca ünlü uzun bir savunma duvarına sahiptir.",
      "Dev pandaların doğal yaşam alanlarından biridir.",
      "Başkentinin adı Pekin'dir."
    ],
    "fact": "Çin Seddi farklı dönemlerde inşa edilmiş çok sayıda bölümden oluşur."
  },
  {
    "countryId": "276",
    "difficulty": 1,
    "clues": [
      "Berlin Duvarı yakın tarihinde önemli bir yer tutar.",
      "Oktoberfest adlı festivalle tanınır.",
      "Başkentinin adı Berlin'dir."
    ],
    "fact": "Ülke 1990 yılında yeniden birleşmiştir."
  },
  {
    "countryId": "826",
    "difficulty": 1,
    "clues": [
      "Big Ben adıyla bilinen saat kulesi simgelerindendir.",
      "Trafik soldan akar.",
      "Başkentinin adı Londra'dır."
    ],
    "fact": "İngiltere, İskoçya, Galler ve Kuzey İrlanda'dan oluşur."
  },
  {
    "countryId": "356",
    "difficulty": 1,
    "clues": [
      "Tac Mahal adlı anıt bu ülkededir.",
      "Ganj Nehri önemli nehirlerinden biridir.",
      "Başkentinin adı Yeni Delhi'dir."
    ],
    "fact": "Tac Mahal, Agra şehrinde bulunur."
  },
  {
    "countryId": "643",
    "difficulty": 1,
    "clues": [
      "Sibirya adlı geniş coğrafyanın büyük bölümü bu ülkededir.",
      "Toprakları Avrupa ve Asya'ya yayılır.",
      "Başkentinin adı Moskova'dır."
    ],
    "fact": "Yüzölçümü bakımından dünyanın en büyük ülkesidir."
  },
  {
    "countryId": "724",
    "difficulty": 1,
    "clues": [
      "Flamenko kültürüyle tanınır.",
      "İber Yarımadası'nda yer alır.",
      "Başkentinin adı Madrid'dir."
    ],
    "fact": "Barselona ve Sevilla önemli şehirleridir."
  },
  {
    "countryId": "554",
    "difficulty": 1,
    "clues": [
      "Kivi kuşu ülkeyle özdeşleşmiştir.",
      "Māori kültürü önemli bir yer tutar.",
      "Başkentinin adı Wellington'dur."
    ],
    "fact": "Pasifik Okyanusu'nda iki büyük ana adası vardır."
  },
  {
    "countryId": "032",
    "difficulty": 1,
    "clues": [
      "Tango dansıyla tanınır.",
      "Patagonya bölgesinin bir bölümünü kapsar.",
      "Başkentinin adı Buenos Aires'tir."
    ],
    "fact": "Güney Amerika'nın güneyinde yer alır."
  },
  {
    "countryId": "410",
    "difficulty": 1,
    "clues": [
      "K-pop ve çağdaş popüler kültürüyle tanınır.",
      "Kore Yarımadası'nın güneyinde yer alır.",
      "Başkentinin adı Seul'dür."
    ],
    "fact": "Yarımadayı kuzeyde başka bir Kore devletiyle paylaşır."
  },
  {
    "countryId": "604",
    "difficulty": 1,
    "clues": [
      "Machu Picchu antik kenti bu ülkededir.",
      "And Dağları topraklarından geçer.",
      "Başkentinin adı Lima'dır."
    ],
    "fact": "Machu Picchu, İnka uygarlığının önemli bir mirasıdır."
  },
  {
    "countryId": "484",
    "difficulty": 1,
    "clues": [
      "Aztek ve Maya uygarlıklarının izlerini taşır.",
      "Yucatán Yarımadası ülkenin bir parçasıdır.",
      "Başkentinin adı Meksiko'dur."
    ],
    "fact": "Kuzey Amerika'nın güneyinde yer alır."
  },
  {
    "countryId": "300",
    "difficulty": 2,
    "clues": [
      "Antik çağda pek çok şehir devletine ev sahipliği yapmıştır.",
      "Akropolis, ülkenin tarihî simgelerindendir.",
      "Başkentinin adı Atina'dır."
    ],
    "fact": "Ege Denizi'ndeki çok sayıda adaya sahiptir."
  },
  {
    "countryId": "504",
    "difficulty": 2,
    "clues": [
      "Atlas Dağları ülkenin içinden geçer.",
      "Marakeş önemli tarihî şehirlerindendir.",
      "Başkentinin adı Rabat'tır."
    ],
    "fact": "Afrika'nın kuzeybatısında Atlantik ve Akdeniz'e kıyısı vardır."
  },
  {
    "countryId": "578",
    "difficulty": 2,
    "clues": [
      "Derin deniz girintileri olan fiyortlarıyla tanınır.",
      "Kuzey Işıkları bazı bölgelerinde izlenebilir.",
      "Başkentinin adı Oslo'dur."
    ],
    "fact": "İskandinav Yarımadası'nın batısındadır."
  },
  {
    "countryId": "246",
    "difficulty": 2,
    "clues": [
      "Sauna kültürüyle ünlüdür.",
      "Çok sayıda gölü nedeniyle bin göller ülkesi diye anılır.",
      "Başkentinin adı Helsinki'dir."
    ],
    "fact": "Kuzey Avrupa'da yer alır."
  },
  {
    "countryId": "752",
    "difficulty": 2,
    "clues": [
      "Başkentinde Nobel ödüllerinin çoğu takdim edilir.",
      "Baltık Denizi'ne kıyısı vardır.",
      "Başkentinin adı Stockholm'dür."
    ],
    "fact": "Nobel Barış Ödülü ise komşu bir ülkede verilir."
  },
  {
    "countryId": "372",
    "difficulty": 2,
    "clues": [
      "Zümrüt Ada olarak anılır.",
      "Dublin önemli edebiyat geleneklerine ev sahipliği yapar.",
      "Başkentinin adı Dublin'dir."
    ],
    "fact": "Atlas Okyanusu'nda Britanya'nın batısındaki adanın büyük bölümündedir."
  },
  {
    "countryId": "528",
    "difficulty": 2,
    "clues": [
      "Topraklarının bir bölümü deniz seviyesinin altındadır.",
      "Kanalları, laleleri ve yel değirmenleriyle ünlüdür.",
      "Başkentinin adı Amsterdam'dır."
    ],
    "fact": "Denizden toprak kazanma çalışmalarıyla tanınır."
  },
  {
    "countryId": "756",
    "difficulty": 2,
    "clues": [
      "Dört ulusal dile sahip bir Avrupa ülkesidir.",
      "Alplerin önemli bir bölümü burada bulunur.",
      "Başkent işlevini Bern üstlenir."
    ],
    "fact": "Tarafsızlık geleneği ve saatleriyle tanınır."
  },
  {
    "countryId": "231",
    "difficulty": 2,
    "clues": [
      "Lalibela'da kayaya oyulmuş kiliseler vardır.",
      "Afrika Boynuzu bölgesindedir.",
      "Başkentinin adı Addis Ababa'dır."
    ],
    "fact": "Afrika Birliği'nin genel merkezi bu başkenttedir."
  },
  {
    "countryId": "360",
    "difficulty": 2,
    "clues": [
      "Bali Adası önemli turizm merkezlerindendir.",
      "Binlerce adadan oluşan bir takımadadır.",
      "Cakarta en büyük şehirlerinden biridir."
    ],
    "fact": "Ekvator çevresindeki Güneydoğu Asya takımadalarında yer alır."
  },
  {
    "countryId": "404",
    "difficulty": 2,
    "clues": [
      "Masai Mara adlı yaban hayatı bölgesiyle tanınır.",
      "Hint Okyanusu kıyısına sahiptir.",
      "Başkentinin adı Nairobi'dir."
    ],
    "fact": "Doğu Afrika'da yer alır."
  },
  {
    "countryId": "268",
    "difficulty": 2,
    "clues": [
      "Kafkas Dağları yakınında bulunur.",
      "Başkentinin adı Tiflis'tir.",
      "Karadeniz'in doğu kıyısında yer alır."
    ],
    "fact": "Geleneksel kvevri kaplarında şarap yapımıyla tanınır."
  },
  {
    "countryId": "704",
    "difficulty": 2,
    "clues": [
      "Ha Long Körfezi dikkat çekici kireçtaşı adalarıyla ünlüdür.",
      "Mekong Deltası ülkenin güneyindedir.",
      "Başkentinin adı Hanoi'dir."
    ],
    "fact": "Güneydoğu Asya'da uzun bir kıyı şeridine sahiptir."
  },
  {
    "countryId": "566",
    "difficulty": 2,
    "clues": [
      "Lagos adlı çok büyük bir kenti vardır.",
      "Afrika'nın batısındaki Gine Körfezi'ne kıyısı vardır.",
      "Başkentinin adı Abuja'dır."
    ],
    "fact": "Afrika'nın nüfusu en yüksek ülkelerindendir."
  },
  {
    "countryId": "858",
    "difficulty": 2,
    "clues": [
      "La Plata haliçinin kuzey kıyısında bulunur.",
      "Güney Amerika'da Atlantik kıyısına sahiptir.",
      "Başkentinin adı Montevideo'dur."
    ],
    "fact": "Brezilya ve Arjantin arasında yer alır."
  },
  {
    "countryId": "398",
    "difficulty": 2,
    "clues": [
      "Bozkırları ve geniş iç ovalarıyla tanınır.",
      "Dünyanın yüzölçümü en büyük denize kıyısı olmayan ülkesidir.",
      "Başkentinin adı Astana'dır."
    ],
    "fact": "Orta Asya'da yer alır."
  },
  {
    "countryId": "862",
    "difficulty": 2,
    "clues": [
      "Angel Şelalesi bu ülkededir.",
      "Karayip Denizi'ne kıyısı vardır.",
      "Başkentinin adı Karakas'tır."
    ],
    "fact": "Angel Şelalesi, dünyanın en yüksek kesintisiz şelalelerindendir."
  },
  {
    "countryId": "608",
    "difficulty": 2,
    "clues": [
      "Luzon ve Mindanao büyük adalarındandır.",
      "Yedi binden fazla adadan oluşan bir ülkedir.",
      "Başkentinin adı Manila'dır."
    ],
    "fact": "Güneydoğu Asya'da Pasifik kıyısındadır."
  },
  {
    "countryId": "764",
    "difficulty": 2,
    "clues": [
      "Ayutthaya adlı tarihî kentle tanınır.",
      "Güneydoğu Asya'da Andaman Denizi'ne kıyısı vardır.",
      "Başkentinin adı Bangkok'tur."
    ],
    "fact": "Ülke geçmişte Siyam adıyla biliniyordu."
  },
  {
    "countryId": "064",
    "difficulty": 3,
    "clues": [
      "Himalayalar'da yer alan küçük bir ülkedir.",
      "Kalkınma tartışmalarında Gayrisafi Millî Mutluluk kavramıyla anılır.",
      "Başkentinin adı Thimbu'dur."
    ],
    "fact": "Hindistan ve Çin arasında yer alır."
  },
  {
    "countryId": "072",
    "difficulty": 3,
    "clues": [
      "Okavango Deltası önemli doğal alanıdır.",
      "Afrika'nın güneyinde denize kıyısı olmayan bir ülkedir.",
      "Başkentinin adı Gaborone'dir."
    ],
    "fact": "Okavango, büyük bir iç deltadır."
  },
  {
    "countryId": "084",
    "difficulty": 3,
    "clues": [
      "Great Blue Hole adlı su altı çukuru yakınındadır.",
      "Orta Amerika'da Karayip Denizi'ne kıyısı vardır.",
      "Başkentinin adı Belmopan'dır."
    ],
    "fact": "Orta Amerika'da İngilizcenin resmî dil olduğu ülkedir."
  },
  {
    "countryId": "096",
    "difficulty": 3,
    "clues": [
      "Borneo Adası'nın kuzeyinde yer alır.",
      "Petrol ve doğal gaz kaynaklarıyla tanınan küçük bir sultanlıktır.",
      "Başkentinin adı Bandar Seri Begavan'dır."
    ],
    "fact": "Güneydoğu Asya'daki bir monarşidir."
  },
  {
    "countryId": "108",
    "difficulty": 3,
    "clues": [
      "Tanganika Gölü'ne kıyısı vardır.",
      "Afrika'nın Büyük Göller bölgesindedir.",
      "Siyasi başkentinin adı Gitega'dır."
    ],
    "fact": "Denize kıyısı olmayan bir Doğu Afrika ülkesidir."
  },
  {
    "countryId": "148",
    "difficulty": 3,
    "clues": [
      "Sahel kuşağında uzanan bir ülkedir.",
      "Adını taşıyan büyük göl batısında yer alır.",
      "Başkentinin adı Encemine'dir."
    ],
    "fact": "Sahra Çölü'nün güney sınırında yer alır."
  },
  {
    "countryId": "262",
    "difficulty": 3,
    "clues": [
      "Afar Çöküntüsü'nün yakınında bulunur.",
      "Babülmendep Boğazı yakınında önemli konumdadır.",
      "Başkent ile ülke aynı adı taşır; Kızıldeniz'e açılan önemli bir limanı vardır."
    ],
    "fact": "Afrika Boynuzu'nda Kızıldeniz'in girişindedir."
  },
  {
    "countryId": "266",
    "difficulty": 3,
    "clues": [
      "Ekvator çizgisi içinden geçer.",
      "Atlantik Okyanusu'na kıyısı olan bir Orta Afrika ülkesidir.",
      "Başkentinin adı Librevil'dir."
    ],
    "fact": "Geniş tropikal ormanlarla kaplıdır."
  },
  {
    "countryId": "270",
    "difficulty": 3,
    "clues": [
      "Ülke büyük ölçüde aynı adı taşıyan bir nehir boyunca uzanır.",
      "Senegal tarafından neredeyse tümüyle çevrelenir.",
      "Başkentinin adı Banjul'dur."
    ],
    "fact": "Afrika'nın Atlantik kıyısında dar bir kara şerididir."
  },
  {
    "countryId": "324",
    "difficulty": 3,
    "clues": [
      "Futa Calon adı verilen yüksek arazisi bulunur.",
      "Batı Afrika'da Atlantik'e kıyısı vardır.",
      "Başkentinin adı Konakri'dir."
    ],
    "fact": "Nijer Nehri'nin kaynağı bu ülkenin dağlık bölgelerindedir."
  },
  {
    "countryId": "328",
    "difficulty": 3,
    "clues": [
      "Kaieteur Şelalesi ile tanınır.",
      "Güney Amerika'da İngilizce resmî dildir.",
      "Başkentinin adı Georgetown'dur."
    ],
    "fact": "Kıtanın kuzeydoğu Atlantik kıyısındadır."
  },
  {
    "countryId": "426",
    "difficulty": 3,
    "clues": [
      "Toprakları tamamen bir başka ülkeyle çevrilidir.",
      "Afrika'nın güneyinde dağlık bir ülkedir.",
      "Başkentinin adı Maseru'dur."
    ],
    "fact": "Tamamen Güney Afrika Cumhuriyeti ile çevrilidir."
  },
  {
    "countryId": "430",
    "difficulty": 3,
    "clues": [
      "Başkentinin adı ABD'nin eski bir başkanından gelir.",
      "Batı Afrika'da Atlantik kıyısında yer alır.",
      "Başkentinin adı Monrovia'dır."
    ],
    "fact": "19. yüzyılda özgürleştirilmiş siyah Amerikalıların yerleşimiyle bağı vardır."
  },
  {
    "countryId": "454",
    "difficulty": 3,
    "clues": [
      "Afrika'nın büyük yarık vadisi çevresindedir.",
      "Adını taşıyan uzun bir göle kıyısı vardır.",
      "Başkentinin adı Lilongve'dir."
    ],
    "fact": "Güneydoğu Afrika'da denize kıyısı yoktur."
  },
  {
    "countryId": "466",
    "difficulty": 3,
    "clues": [
      "Timbuktu adlı tarihî çöl kenti buradadır.",
      "Nijer Nehri ülke topraklarından geçer.",
      "Başkentinin adı Bamako'dur."
    ],
    "fact": "Batı Afrika'daki Sahel ülkelerinden biridir."
  },
  {
    "countryId": "478",
    "difficulty": 3,
    "clues": [
      "Topraklarının büyük bölümü Sahra Çölü'ndedir.",
      "Atlantik kıyısında yer alan bir Batı Afrika ülkesidir.",
      "Başkentinin adı Nuakşot'tur."
    ],
    "fact": "Sahra'nın batı ucundaki geniş çöl ülkesidir."
  },
  {
    "countryId": "508",
    "difficulty": 3,
    "clues": [
      "Hint Okyanusu boyunca uzun bir kıyısı vardır.",
      "Resmî dili Portekizcedir.",
      "Başkentinin adı Maputo'dur."
    ],
    "fact": "Afrika'nın güneydoğu kıyısında yer alır."
  },
  {
    "countryId": "516",
    "difficulty": 3,
    "clues": [
      "Namib Çölü bu ülkenin kıyıları boyunca uzanır.",
      "Atlantik Okyanusu'na kıyısı vardır.",
      "Başkentinin adı Windhoek'tir."
    ],
    "fact": "Afrika'nın güneybatısındaki çöl ülkelerindendir."
  },
  {
    "countryId": "548",
    "difficulty": 3,
    "clues": [
      "Melanezya bölgesindeki adalardan oluşur.",
      "Güney Pasifik'te volkanik adalarıyla tanınır.",
      "Başkentinin adı Port Vila'dır."
    ],
    "fact": "Pasifik Okyanusu'nda bir ada ülkesidir."
  },
  {
    "countryId": "562",
    "difficulty": 3,
    "clues": [
      "Sahel kuşağında denize kıyısı olmayan bir ülkedir.",
      "Adını Afrika'nın büyük nehirlerinden biriyle paylaşır.",
      "Başkentinin adı Niamey'dir."
    ],
    "fact": "Sahra'nın güneyindeki Batı Afrika ülkelerindendir."
  },
  {
    "countryId": "646",
    "difficulty": 3,
    "clues": [
      "Bin Tepeli Ülke olarak anılır.",
      "Afrika'nın Büyük Göller bölgesinde yer alır.",
      "Başkentinin adı Kigali'dir."
    ],
    "fact": "Afrika'nın doğusunda, denize kıyısı olmayan bir ülkedir."
  },
  {
    "countryId": "716",
    "difficulty": 3,
    "clues": [
      "Orta Çağ'dan kalma büyük taş duvarlı bir yerleşim kalıntısıyla tanınır.",
      "Victoria Şelalesi'nin bir kıyısı ülke sınırlarındadır.",
      "Başkentinin adı Harare'dir."
    ],
    "fact": "Afrika'nın güneyinde denize kıyısı olmayan bir ülkedir."
  },
  {
    "countryId": "768",
    "difficulty": 3,
    "clues": [
      "Gine Körfezi'ne dar bir kıyısı vardır.",
      "Batı Afrika'da kuzey-güney doğrultusunda uzanır.",
      "Başkentinin adı Lome'dir."
    ],
    "fact": "Gana ve Benin arasında yer alır."
  },
  {
    "countryId": "780",
    "difficulty": 3,
    "clues": [
      "Karayipler'de Venezuela kıyısına yakındır.",
      "Adını oluşturan iki ana ada ile tanınır.",
      "Başkentinin adı Port of Spain'dir."
    ],
    "fact": "Karayipler'in güney ucundaki ada devletidir."
  },
{
  "countryId": "152",
  "difficulty": 1,
  "clues": [
    "Güney Amerika'nın batı kıyısında kuzeyden güneye çok uzun uzanır.",
    "Kuzeyinde dünyanın en kurak çöllerinden biri bulunur.",
    "Başkentinin adı Santiago'dur."
  ],
  "fact": "And Dağları ülkenin doğu sınırı boyunca uzanırken Pasifik Okyanusu batısında yer alır."
},
{
  "countryId": "170",
  "difficulty": 1,
  "clues": [
    "Güney Amerika'da hem Pasifik Okyanusu'na hem Karayip Denizi'ne kıyısı vardır.",
    "Kahve yetiştirilen dağlık bölgeleri ve zengin kuş çeşitliliğiyle tanınır.",
    "Başkentinin adı Bogota'dır."
  ],
  "fact": "And Dağları ülke içinde üç ana sıradağ koluna ayrılır."
},
{
  "countryId": "192",
  "difficulty": 1,
  "clues": [
    "Karayipler'deki en büyük adanın büyük bölümünü kaplar.",
    "Sierra Maestra Dağları ve tarihî puro üretimiyle tanınır.",
    "Başkentinin adı Havana'dır."
  ],
  "fact": "Ada, Karayip Denizi ile Atlas Okyanusu arasında uzanan Büyük Antiller zincirindedir."
},
{
  "countryId": "218",
  "difficulty": 2,
  "clues": [
    "Güney Amerika'da hem And Dağları'na hem Pasifik kıyısına sahiptir.",
    "Açıklarındaki volkanik adalar, dev kaplumbağalarıyla ünlüdür.",
    "Başkentinin adı Quito'dur."
  ],
  "fact": "Ekvator çizgisi ülkenin kuzeyinden geçer; Galápagos Adaları biyolojik çeşitlilik açısından önemlidir."
},
{
  "countryId": "050",
  "difficulty": 2,
  "clues": [
    "Güney Asya'da çok geniş ve alçak bir nehir deltası üzerinde bulunur.",
    "Mangrov ormanlarıyla tanınan Sundarbans'ın bir bölümüne ev sahipliği yapar.",
    "Başkentinin adı Dakka'dır."
  ],
  "fact": "Ganj, Brahmaputra ve Meghna nehir sistemlerinin oluşturduğu deltada muson taşkınları önemlidir."
},
{
  "countryId": "450",
  "difficulty": 2,
  "clues": [
    "Afrika'nın güneydoğu kıyılarının açığında büyük bir adadır.",
    "Lemurların doğal yaşam alanı olması ve baobab ağaçlarıyla tanınır.",
    "Başkentinin adı Antananarivo'dur."
  ],
  "fact": "Uzun coğrafi yalıtım nedeniyle çok sayıda bitki ve hayvan türü burada endemiktir."
},
{
  "countryId": "834",
  "difficulty": 3,
  "clues": [
    "Doğu Afrika'da Hint Okyanusu kıyısında yer alır.",
    "Afrika'nın en yüksek dağı ve Zanzibar adaları bu ülkeyle ilişkilidir.",
    "Başkentinin adı Dodoma'dır."
  ],
  "fact": "Serengeti düzlükleri ve Ngorongoro koruma alanı geniş savan ekosistemlerine sahiptir."
},
{
  "countryId": "418",
  "difficulty": 3,
  "clues": [
    "Güneydoğu Asya'da denize kıyısı olmayan bir ülkedir.",
    "Mekong Nehri önemli ulaşım ve tarım yollarından biridir.",
    "Başkentinin adı Vientiane'dir."
  ],
  "fact": "Luang Prabang'ın tarihî merkezi geleneksel ve sömürge dönemi mimarisini bir arada gösterir."
},
{
  "countryId": "242",
  "difficulty": 3,
  "clues": [
    "Güney Pasifik'te yüzlerce adadan oluşan bir devlettir.",
    "Mercan resifleri ve Viti Levu ile Vanua Levu adlı iki büyük adasıyla bilinir.",
    "Başkentinin adı Suva'dır."
  ],
  "fact": "Ada grubunun bir bölümü volkanik kökenlidir ve çevresindeki resifler zengin deniz yaşamı barındırır."
},
{
  "countryId": "620",
  "difficulty": 1,
  "clues": [
    "Avrupa'nın batısında Atlas Okyanusu kıyısına uzanır.",
    "Azorlar ve Madeira adlı Atlantik takımadalarıyla ilişkilidir.",
    "Başkentinde Tejo Nehri'nin geniş bir haliç oluşturduğu görülür."
  ],
  "fact": "Madeira ve Azorlar, ana karadan uzakta bulunan ve volkanik kökenli adaları içeren Atlantik takımadalarıdır."
},
{
  "countryId": "191",
  "difficulty": 1,
  "clues": [
    "Adriyatik Denizi boyunca çok sayıda adaya sahip uzun bir kıyısı vardır.",
    "Dalmaçya kıyılarındaki tarihî taş kentleriyle tanınır.",
    "Başkentinin adı Zagreb'dir."
  ],
  "fact": "Adriyatik kıyısındaki adalar ve koylar, bölgenin deniz ulaşımı ile turizminde önemli rol oynar."
},
{
  "countryId": "710",
  "difficulty": 1,
  "clues": [
    "Afrika kıtasının en güneyindeki ülkelerden biridir.",
    "Cape Yarımadası'ndaki Masa Dağı önemli doğal simgelerindendir.",
    "Yürütme merkezi Pretoria, yasama merkezi Cape Town'dadır."
  ],
  "fact": "Ülkenin üç ayrı başkent işlevi bulunur: Pretoria yürütme, Cape Town yasama, Bloemfontein ise yargı merkezi olarak bilinir."
},
{
  "countryId": "188",
  "difficulty": 2,
  "clues": [
    "Orta Amerika'da hem Pasifik'e hem Karayip Denizi'ne kıyısı vardır.",
    "Bulut ormanları ve volkanik millî parklarıyla tanınır.",
    "Başkentinin adı San José'dir."
  ],
  "fact": "Bulut ormanlarında nemli hava yüksek rakımlı bitki örtüsünü besler; ülke çok çeşitli kuş ve amfibi türlerine ev sahipliği yapar."
},
{
  "countryId": "524",
  "difficulty": 2,
  "clues": [
    "Güney Asya'da Himalayalar'ın yüksek zirveleri arasında yer alır.",
    "Dünyanın en yüksek dağına komşu olan, denize kıyısı bulunmayan bir ülkedir.",
    "Başkentinin adı Katmandu'dur."
  ],
  "fact": "Yükseklik farkları nedeniyle tropikal alçak vadilerden alp kuşağına kadar çok farklı iklim ve yaşam alanları bulunur."
},
{
  "countryId": "352",
  "difficulty": 2,
  "clues": [
    "Kuzey Atlas Okyanusu'nda yer alan bir ada devletidir.",
    "Buzullar, lav alanları ve sıcak su kaynakları bir arada bulunur.",
    "Başkentinin adı Reykjavik'tir."
  ],
  "fact": "Orta Atlantik Sırtı'nın su üstüne çıktığı bölgelerden biridir; levha hareketleri volkanik ve jeotermal etkinliklerle ilişkilidir."
},
{
  "countryId": "598",
  "difficulty": 3,
  "clues": [
    "Okyanusya'da dünyanın en büyük adalarından birinin doğu bölümünü kaplar.",
    "Yüksek dağ sıraları ve tropikal yağmur ormanlarıyla kaplıdır.",
    "Başkentinin adı Port Moresby'dir."
  ],
  "fact": "Yeni Gine adasının doğu kesimindeki çok farklı yükselti ve vadiler, olağanüstü dil ve canlı çeşitliliğiyle ilişkilidir."
},
{
  "countryId": "417",
  "difficulty": 3,
  "clues": [
    "Orta Asya'da denize kıyısı bulunmayan dağlık bir ülkedir.",
    "Tanrı Dağları ve yüksek rakımlı Issık Gölü önemli doğal özelliklerindendir.",
    "Başkentinin adı Bişkek'tir."
  ],
  "fact": "Issık Göl, çevresi yüksek dağlarla kuşatılmış büyük bir dağ gölüdür; adı yerel dillerde sıcak göl anlamına gelir."
},
{
  "countryId": "894",
  "difficulty": 3,
  "clues": [
    "Afrika'nın güneyinde denize kıyısı olmayan bir ülkedir.",
    "Zambezi Nehri boyunca büyük bir şelaleyi komşusuyla paylaşır.",
    "Başkentinin adı Lusaka'dır."
  ],
  "fact": "Zambezi üzerindeki Victoria Şelaleleri, komşu Zimbabve ile sınır yakınında yer alır; nehir Kariba Gölü'nü de besler."
},
  {
    "countryId": "040",
    "difficulty": 1,
    "clues": [
      "Orta Avrupa'da Alpler'in doğu kesiminde uzanan, denize kıyısı olmayan bir ülkedir.",
      "Tuna Nehri kıyısında gelişen tarihî başkenti, klasik müzikle yakından ilişkilidir.",
      "Başkentinde Schönbrunn Sarayı ve Ringstrasse adlı tarihî bulvar bulunur."
    ],
    "fact": "Viyana'nın tarihî merkezi, Orta Çağ'dan Barok döneme ve 19. yüzyıla uzanan mimari katmanlar içerir.",
    "sourceUrl": "https://whc.unesco.org/en/list/1033/"
  },
  {
    "countryId": "400",
    "difficulty": 2,
    "clues": [
      "Batı Asya'da Akabe Körfezi'ne kısa bir kıyısı bulunan ülkedir.",
      "Kızıl kumtaşı kayalara oyulmuş antik bir kervan kentiyle tanınır.",
      "Ölü Deniz'in doğu kıyısında yer alır; başkenti Amman'dır."
    ],
    "fact": "Petra, Nebatilerin kayalara oyduğu anıtları ve çöl ortamında suyu toplayıp dağıtan mühendislik yapılarıyla tanınır.",
    "sourceUrl": "https://whc.unesco.org/en/list/326/"
  },
  {
    "countryId": "024",
    "difficulty": 3,
    "clues": [
      "Afrika'nın güneybatısında Atlas Okyanusu'na açılan geniş kıyıları vardır.",
      "Eski Kongo Krallığı'nın tarihî başkentinin kalıntıları bu ülkenin kuzeyindedir.",
      "Kwanza Nehri iç kesimlerden batıya akarak okyanusa ulaşır."
    ],
    "fact": "Mbanza Kongo, 14.–19. yüzyıllar arasında Kongo Krallığı'nın siyasal ve ruhani merkeziydi.",
    "sourceUrl": "https://whc.unesco.org/en/list/1511/"
  },
  {
    "countryId": "144",
    "difficulty": 2,
    "clues": [
      "Hint Okyanusu'nda, Hindistan'ın güneyine yakın büyük bir adada yer alır.",
      "Tropikal ormanların üzerinde yükselen kayalık bir tepede 5. yüzyıldan kalma saray kalıntıları bulunur.",
      "Çay yetiştirilen dağlık bölgeleri ve Kandy kentindeki tarihî tapınağıyla tanınır."
    ],
    "fact": "Sigiriya'daki kayalık saray yerleşimi 5. yüzyılda Kral Kassapa döneminde gelişti ve UNESCO Dünya Mirası listesindedir.",
    "sourceUrl": "https://whc.unesco.org/en/list/202/"
  },
  {
    "countryId": "686",
    "difficulty": 2,
    "clues": [
      "Batı Afrika'da Atlas Okyanusu kıyısında, Sahel kuşağından kıyı ovalarına uzanan bir ülkedir.",
      "Başkentinin yakınındaki küçük bir ada, Atlantik köle ticaretinin acı tarihini hatırlatan önemli bir miras alanıdır.",
      "Dakar'ın bulunduğu Cap-Vert Yarımadası, Afrika ana karasının en batıdaki uçlarından biridir."
    ],
    "fact": "Dakar açıklarındaki Gorée Adası, Atlantik köle ticareti tarihinin hatırlanması açısından önemli bir UNESCO Dünya Mirası alanıdır.",
    "sourceUrl": "https://whc.unesco.org/en/list/26/"
  },
  {
    "countryId": "204",
    "difficulty": 3,
    "clues": [
      "Batı Afrika'da Gine Körfezi'ne kıyısı olan ve güneyinde lagünler bulunan bir ülkedir.",
      "Abomey'deki tarihî kraliyet sarayları, 17.–19. yüzyıllarda hüküm süren güçlü bir krallığın izlerini taşır.",
      "Resmî başkenti Porto-Novo'dur; hükümetin birçok kurumu ise Kotonu kentindedir."
    ],
    "fact": "Abomey Kraliyet Sarayları, Dahomey Krallığı'nın tarihî yönetim merkezinin izlerini taşır ve UNESCO Dünya Mirası listesindedir.",
    "sourceUrl": "https://whc.unesco.org/en/list/323/"
  }
,
  {
    "countryId": "203",
    "difficulty": 1,
    "clues": [
      "Orta Avrupa'da, tarihî kent merkezleri ve nehir vadileriyle tanınan bir ülkedir.",
      "Vltava Nehri üzerindeki taş köprü ve Orta Çağ'dan kalma kale yerleşimi başkentinin simgelerindendir.",
      "Başkentinin adı Prag'dır."
    ],
    "fact": "Prag'ın tarihî merkezi, Gotik ve Barok dönemlere ait yapılarıyla UNESCO Dünya Mirası listesindedir.",
    "sourceUrl": "https://whc.unesco.org/en/list/616/"
  },
  {
    "countryId": "512",
    "difficulty": 2,
    "clues": [
      "Arap Yarımadası'nın güneydoğusunda, hem Arap Denizi'ne hem de bir körfeze kıyısı olan ülkedir.",
      "Güneyindeki Dhofar bölgesi, eski çağlarda tütsü reçinesi ticaretiyle önemli bir merkezdi.",
      "Başkentinin adı Maskat'tır."
    ],
    "fact": "Dhofar'daki günlük ağaçları, kervan vahası ve eski limanlar, tarihî günlük ticaretinin izlerini taşır.",
    "sourceUrl": "https://whc.unesco.org/en/list/1010/"
  },
  {
    "countryId": "762",
    "difficulty": 3,
    "clues": [
      "Orta Asya'nın güneydoğusunda, büyük bölümü yüksek dağlarla kaplı, denize kıyısı olmayan bir ülkedir.",
      "Pamir Dağları'ndaki yüksek platolar, buzullar ve derin vadiler coğrafyasını belirler.",
      "Başkentinin adı Duşanbe'dir."
    ],
    "fact": "Pamir Dağları'ndaki millî park, kutup bölgeleri dışındaki en uzun vadi buzullarından birini barındırır.",
    "sourceUrl": "https://whc.unesco.org/en/list/1252/"
  }
];

export const COUNTRY_CLUES: Readonly<Record<string, CountryClueCard>> =
  Object.fromEntries(cards.map(card => [card.countryId, card]));

export const CLUE_COUNTRIES_BY_DIFFICULTY: Readonly<Record<Difficulty, string[]>> = {
  1: cards.filter(card => card.difficulty === 1).map(card => card.countryId),
  2: cards.filter(card => card.difficulty === 2).map(card => card.countryId),
  3: cards.filter(card => card.difficulty === 3).map(card => card.countryId),
};

export const getCountryClue = (countryId: string | null): CountryClueCard | null =>
  countryId ? COUNTRY_CLUES[countryId] ?? null : null;
