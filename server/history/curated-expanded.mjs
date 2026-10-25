// Globriva Medeniyet Dedektifi: ten extra independent heritage and civic-history cases.
// Every source panorama is part of the pre-approved four-angle collection.
// Each case carries its own fact source, three original four-choice questions,
// and neutral pre-answer clues. Questions do not show the correct option in the clue.
const msg=(tr,en)=>({tr,en});
const question=(tr,en,trOptions,enOptions,correct,trExplanation,enExplanation)=>({
 prompt:msg(tr,en),options:trOptions.map((v,i)=>msg(v,enOptions[i])),correct,
 explanation:msg(trExplanation,enExplanation),
});
export const HISTORY_EXPANDED_CASES=[
 {
 id:"history-central-market",difficulty:"easy",panoramaId:"pb3490dc48a61d6d63ee70f50",
 monument:msg("Phnom Penh Merkez Pazarı","Phnom Penh Central Market"),place:msg("Phnom Penh, Kamboçya","Phnom Penh, Cambodia"),era:msg("1935–1937 · 20. yüzyıl","1935–1937 · 20th century"),tradition:msg("Art Deco mimari","Art Deco architecture"),purpose:msg("Ticaret ve pazar alanı","Trade and market stalls"),
 clue:msg("Merkezdeki kubbeyi, geometrik kolları ve dükkân sıralarını incele.","Examine the central dome, geometric wings and lines of market stalls."),fact:msg("Phnom Penh'in Merkez Pazarı 1935–1937'de Art Deco üslubunda inşa edildi; merkezi kubbenin çevresinden dört kol uzanır.","The Central Market was built in 1935–1937 in the Art Deco style, with four wings radiating from its central dome."),sourceUrl:"https://www.tourismcambodia.com/travelguides/provinces/phnom-penh/what-to-see/25_central.htm",
 questions:[
  question("Bu yapının mimari üslubu hangisidir?","Which architectural style characterizes this building?",["Art Deco","Romanesk","Gotik","Brütalizm"],["Art Deco","Romanesque","Gothic","Brutalism"],0,"Geometrik kubbe ve düzen, Art Deco üslubunun izleridir.","The geometric dome and layout are characteristic of Art Deco."),
  question("Yapı hangi yıllarda inşa edildi?","When was this market constructed?",["1600–1650","1935–1937","1990–2000","MÖ 200–100"],["1600–1650","1935–1937","1990–2000","200–100 BCE"],1,"Merkez Pazarı 1935–1937 arasında inşa edilmiştir.","Central Market was constructed in 1935–1937."),
  question("Bu yapının asli işlevi nedir?","What was this building originally intended for?",["Kraliyet sarayı","Askerî kale","Ticaret pazarı","Gözlemevi"],["Royal palace","Fortress","Marketplace","Observatory"],2,"Dükkânların bulunduğu yapı bir merkez pazardır.","The building accommodates a central market with shops.")
 ],
 },
 {
 id:"history-alameda",difficulty:"easy",panoramaId:"p6aa1f13594e209052646e192",
 monument:msg("Alameda Central Tarihî Parkı","Historic Alameda Central"),place:msg("Meksiko, Meksika","Mexico City, Mexico"),era:msg("1592 · 16. yüzyıl sonları","1592 · Late 16th century"),tradition:msg("Sömürge dönemi kent bahçeleri","Colonial urban gardens"),purpose:msg("Halka açık park ve gezinti alanı","Public park and promenade"),
 clue:msg("Ağaç dizilerine, yolların geometrisine ve kamusal heykellere dikkat et.","Observe the tree lines, paths and public sculptures."),fact:msg("Alameda Central 1592'de açıldı. Latin Amerika'nın en eski kamusal parklarından biridir.","Alameda Central opened in 1592 and is among Latin America's oldest public parks."),sourceUrl:"https://mexicocity.cdmx.gob.mx/venues/alameda-central/",
 questions:[
  question("Bu tarihî kent parkı hangi yüzyılda oluşturuldu?","In which century was this historic park established?",["16. yüzyıl","19. yüzyıl","20. yüzyıl","MÖ 1. yüzyıl"],["16th century","19th century","20th century","1st century BCE"],0,"Alameda Central 1592'de kuruldu.","Alameda Central was established in 1592."),
  question("Parkın kuruluşuyla ilişkili yönetim dönemi hangisidir?","Which administration founded this park?",["Osmanlı","İspanyol sömürge yönetimi","İnka İmparatorluğu","Fransız Cumhuriyeti"],["Ottoman","Spanish colonial administration","Inca Empire","French Republic"],1,"Park İspanyol sömürge dönemi genel valisi zamanında kuruldu.","The park dates to Spanish colonial viceroyalty rule."),
  question("Bu tarihî alanın temel işlevi neydi?","What was the primary purpose of this historic place?",["Liman gümrüğü","Cezaevi","Halk bahçesi ve gezinti","Kışla"],["Port customs","Prison","Public garden and promenade","Barracks"],2,"Şehir halkının dinlenmesi ve gezmesi için planlandı.","It was planned as a public space for recreation.")
 ],
 },
 {
 id:"history-catavento",difficulty:"easy",panoramaId:"pda3c93f8ee9a53c660c1ff3e",
 monument:msg("Catavento Müzesi ve Sanayi Sarayı","Catavento Museum and Palace of Industries"),place:msg("São Paulo, Brezilya","São Paulo, Brazil"),era:msg("1911–1924 · 20. yüzyıl başları","1911–1924 · Early 20th century"),tradition:msg("Sanayi dönemi kamusal mimarisi","Industrial-era civic architecture"),purpose:msg("Başlangıçta sanayi sergileri, bugün müze","Originally industrial exhibitions, now a museum"),
 clue:msg("Avlu planını ve gösterişli taş-tuğla mimarisini incele.","Inspect the courtyard and richly decorated brick-and-stone architecture."),fact:msg("1911–1924 arasında inşa edilen Sanayi Sarayı, daha sonra bilim ve teknoloji müzesi Catavento'ya dönüştürüldü.","Built between 1911 and 1924, the Palace of Industries now hosts the Catavento science and technology museum."),sourceUrl:"https://museucatavento.org.br/palacio-das-industrias",
 questions:[
  question("Bu tarihî yapının ilk kullanım amacı hangisiydi?","What was this building originally designed for?",["Sanayi sergileri","Ortaçağ kalesi","Tersane","Gladyatör arenası"],["Industrial exhibitions","Medieval castle","Shipyard","Gladiator arena"],0,"Yapı Sanayi Sarayı olarak sergi amacıyla tasarlandı.","The Palace of Industries was built to host exhibitions."),
  question("Yapının inşa edildiği dönem hangisidir?","When was this building constructed?",["1500–1530","1911–1924","2000–2010","MÖ 500–400"],["1500–1530","1911–1924","2000–2010","500–400 BCE"],1,"Yapının inşası 1911'de başlayıp 1924'te tamamlandı.","Construction ran from 1911 until 1924."),
  question("Yapı günümüzde ağırlıkla hangi işleve hizmet ediyor?","What is its main use today?",["Parlamento","Tren istasyonu","Bilim ve teknoloji müzesi","Gümrük binası"],["Parliament","Rail station","Science and technology museum","Customs house"],2,"Günümüzde burada Catavento Müzesi bulunuyor.","The building now houses the Catavento Museum.")
 ],
 },
 {
 id:"history-santafe-senate",difficulty:"easy",panoramaId:"p68cebdf86038a7ee0eea5b39",
 monument:msg("Santa Fe Yasama Meclisi","Santa Fe Provincial Legislature"),place:msg("Santa Fe, Arjantin","Santa Fe, Argentina"),era:msg("20. yüzyıl başları · 1914","Early 20th century · 1914"),tradition:msg("Cumhuriyet dönemi yönetim mimarisi","Republican civic architecture"),purpose:msg("Yasama ve senato oturumları","Legislation and senate sessions"),
 clue:msg("Yarı dairesel oturma düzenini, konuşmacı bölümünü ve büyük salonu incele.","Look at the seating rows, speaking area and chamber layout."),fact:msg("Santa Fe eyaletinin yasama binası 1914'te hizmete açıldı; eyalet senatörleri ve milletvekilleri için ayrı salonları vardır.","Santa Fe's provincial legislature building opened in 1914, with chambers for its senators and deputies."),sourceUrl:"https://commons.wikimedia.org/wiki/Category:Legislatura_de_la_Provincia_de_Santa_fe",
 questions:[
  question("Bu salonun yönetimsel işlevi hangisidir?","What is the governmental function of this chamber?",["Yasama görüşmeleri","Askerî eğitim","Kilise ayini","Ticaret borsası"],["Legislative debates","Military training","Church services","Stock exchange"],0,"Burası eyalet yasama meclisinin senato salonudur.","This is the provincial legislature's senate chamber."),
  question("Bu kurum hangi ülkededir?","In which country is this institution located?",["Şili","Arjantin","İspanya","Uruguay"],["Chile","Argentina","Spain","Uruguay"],1,"Santa Fe, Arjantin'de bir eyalet ve şehirdir.","Santa Fe is a province and city in Argentina."),
  question("Bu binanın hizmete açılış yılı hangisidir?","In which year did this legislative building open?",["1810","1996","1914","1542"],["1810","1996","1914","1542"],2,"Santa Fe'nin yasama binası 1914'te açıldı.","Santa Fe's legislative building opened in 1914.")
 ],
 },
 {
 id:"history-bartholomaeus",difficulty:"easy",panoramaId:"p777c3c3055e8ba59967915fb",
 monument:msg("Aziz Bartalmay Tarihî Kilisesi","St. Bartholomew's Historic Church"),place:msg("Oberschützen, Avusturya","Oberschützen, Austria"),era:msg("Yaklaşık 1300 · Orta Çağ","Around 1300 · Middle Ages"),tradition:msg("Ortaçağ Hristiyan kilise mimarisi","Medieval Christian church architecture"),purpose:msg("İbadet ve mezarlık kilisesi","Worship and cemetery church"),
 clue:msg("Taş duvarları, fresk izlerini ve kilise içindeki bölümleri incele.","Inspect the stonework, traces of murals and interior layout."),fact:msg("Yaklaşık 1300'de inşa edilen kilisenin altında 9. yüzyıla ait bir önceki yapının izleri bulundu; ortaçağ freskleri de günümüze ulaştı.","The church was erected around 1300 on the remains of a ninth-century predecessor; medieval murals survive."),sourceUrl:"https://www.oberschuetzen.at/Katholische_Friedhofskirche_St_Bartholomaeus_1",
 questions:[
  question("Günümüzde görülen yapı yaklaşık hangi dönemde inşa edildi?","When was the present church built?",["13.–14. yüzyıllar","18.–19. yüzyıllar","20. yüzyıl","MÖ 1. yüzyıl"],["13th–14th centuries","18th–19th centuries","20th century","1st century BCE"],0,"Bugünkü kilise yaklaşık 1300 yılında inşa edildi.","The present church was built around 1300."),
  question("Bu yapı hangi dinî gelenekle ilişkilidir?","Which religious tradition does this site belong to?",["Budizm","Hristiyanlık","Şintoizm","İnka dini"],["Buddhism","Christianity","Shinto","Inca religion"],1,"Ortaçağ freskleri ve kilise planı Hristiyanlıkla ilişkilidir.","Its church plan and medieval frescoes reflect Christian worship."),
  question("Alttaki daha eski yapı hangi yüzyıla tarihlenir?","From which century does the earlier structure beneath it date?",["3. yüzyıl","19. yüzyıl","9. yüzyıl","21. yüzyıl"],["3rd century","19th century","9th century","21st century"],2,"Arkeolojik izler 9. yüzyıldan kalma bir öncü yapıyı gösterir.","Archaeology identified a ninth-century predecessor.")
 ],
 },
 {
 id:"history-berlin-wall-park",difficulty:"medium",panoramaId:"p170b676a9de5baf00d21d20f",
 monument:msg("Berlin Duvarı'nın İzinde Mauerpark","Mauerpark and the Berlin Wall"),place:msg("Berlin, Almanya","Berlin, Germany"),era:msg("Soğuk Savaş sonrası · 1990'lardan itibaren","Post-Cold War · From the 1990s"),tradition:msg("Kentsel bellek ve dönüşüm","Urban memory and transformation"),purpose:msg("Eski sınır kuşağından kamu parkına dönüşüm","Former border strip transformed into public park"),
 clue:msg("Açık sahne, yükselen oturma sıraları ve parkın çevresindeki kentsel izleri incele.","Observe the open-air stage, stepped seating and nearby urban fabric."),fact:msg("Bugünkü Mauerpark'ın bulunduğu alanın bir bölümü, Berlin Duvarı döneminde Doğu ve Batı Berlin'i ayıran sınır kuşağının parçasıydı.","Part of today's Mauerpark was a former border zone between East and West Berlin during the Berlin Wall era."),sourceUrl:"https://www.ampelmann.de/en/discover-berlin/with-the-ampelmaennchen-on-tour-in-berlin/mauerpark/",
 questions:[
  question("Bu kamusal alanın geçmişi en çok hangi tarihî olayla bağlantılıdır?","Which historic event is most closely tied to this place?",["Berlin'in bölünmesi ve Duvar","Roma Cumhuriyeti'nin yıkılışı","Moğol fetihleri","Sanayi Devrimi'nin başlangıcı"],["Berlin's division and Wall","Fall of Roman Republic","Mongol conquests","Start of the Industrial Revolution"],0,"Alan, eskiden Berlin Duvarı'nın sınır şeridinin bir parçasıydı.","The park occupies land from the former Berlin Wall border strip."),
  question("Duvar'ın açılması hangi yılda yaşandı?","In what year was the Berlin Wall opened?",["1945","1989","1961","2004"],["1945","1989","1961","2004"],1,"Berlin Duvarı'nın açılması Kasım 1989'da yaşandı.","The Berlin Wall was opened in November 1989."),
  question("Eski sınır kuşağının günümüzdeki kullanımına en uygun ifade hangisidir?","What best describes the site's present use?",["Hava üssü","Yasak askerî bölge","Kamusal park ve açık hava etkinlikleri","Antik tapınak"],["Airbase","Forbidden military zone","Public park and outdoor events","Ancient temple"],2,"Alan bugün yeşil park ve açık hava etkinlikleri için kullanılıyor.","Today the area is used as a park and for outdoor activities.")
 ],
 },
 {
 id:"history-azteca",difficulty:"medium",panoramaId:"pf760c7acdb84d7f1c6785433",
 monument:msg("Estadio Azteca · Futbol Tarihi","Estadio Azteca · Football History"),place:msg("Meksiko, Meksika","Mexico City, Mexico"),era:msg("1966 · 20. yüzyıl","1966 · 20th century"),tradition:msg("Modern spor ve kitle kültürü","Modern sports and mass culture"),purpose:msg("Spor karşılaşmaları ve büyük turnuvalar","Sporting events and major tournaments"),
 clue:msg("Tribünlerin eğimini, sahayı kuşatan katları ve yüksek kapasiteyi incele.","Inspect the tiers of stands, sightlines and large spectator capacity."),fact:msg("1966'da açılan Estadio Azteca, 1970 ve 1986 FIFA Dünya Kupası finallerine ev sahipliği yaptı.","Opened in 1966, Estadio Azteca hosted FIFA World Cup finals in 1970 and 1986."),sourceUrl:"https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/estadio-azteca-city",
 questions:[
  question("Bu stadyumun açıldığı yıl hangisidir?","When was this stadium inaugurated?",["1966","1926","2006","1898"],["1966","1926","2006","1898"],0,"Stadyum 1966'da açıldı.","The stadium opened in 1966."),
  question("Bu stadyumda hangi iki Dünya Kupası'nın finali oynandı?","Which two World Cup finals were held at this stadium?",["1930 ve 1950","1970 ve 1986","1994 ve 2002","2010 ve 2014"],["1930 and 1950","1970 and 1986","1994 and 2002","2010 and 2014"],1,"1970 ve 1986 Dünya Kupası finalleri burada oynandı.","The 1970 and 1986 World Cup finals were held here."),
  question("Bu mekânın kültürel tarih açısından en güçlü ilişkisi hangisidir?","What best describes this site's cultural significance?",["Antik denizcilik","Ortaçağ manastırları","Modern futbol tarihi","Mısır piramitleri"],["Ancient navigation","Medieval monasteries","Modern football history","Egyptian pyramids"],2,"Yapı modern dünya futbol tarihinin simge mekânlarındandır.","The venue is a landmark in modern football history.")
 ],
 },
 {
 id:"history-tbilisi-parliament",difficulty:"medium",panoramaId:"p399560d02487c101e36f39aa",
 monument:msg("Tiflis Parlamento Binası","Tbilisi Parliament Building"),place:msg("Tiflis, Gürcistan","Tbilisi, Georgia"),era:msg("1933–1953 · 20. yüzyıl","1933–1953 · 20th century"),tradition:msg("Sovyet dönemi anıtsal kamu mimarisi","Soviet-era monumental civic architecture"),purpose:msg("Hükümet ve parlamento işlevleri","Government and parliamentary uses"),
 clue:msg("Cephedeki simetriye, sütun sıralarına ve anıtsal kamu ölçeğine bak.","Observe the symmetry, colonnades and monumental public scale."),fact:msg("Gürcistan Parlamento binası, 1933–1938 ve 1946–1953 olmak üzere iki ana inşa evresinde gerçekleştirildi; başlangıçta Sovyet Gürcistan yönetim kurumlarını barındırıyordu.","The Georgian Parliament building was constructed in phases during 1933–1938 and 1946–1953 and originally housed Soviet Georgian government institutions."),sourceUrl:"https://taa.net.ge/en/archive-geo/government-palace/",
 questions:[
  question("Bu anıtsal kamu binası ilk olarak hangi tarihî yönetim döneminde geliştirildi?","Under which historical political era was this building first developed?",["Sovyet Gürcistan dönemi","Roma İmparatorluğu","Bizans İmparatorluğu","İspanyol sömürge dönemi"],["Soviet Georgian period","Roman Empire","Byzantine Empire","Spanish colonial era"],0,"Bina, Sovyet Gürcistan'ın devlet kurumları için tasarlandı.","The complex was designed for state bodies of Soviet Georgia."),
  question("Bina hangi yüzyılda inşa edildi?","In which century was this building constructed?",["18. yüzyıl","20. yüzyıl","15. yüzyıl","21. yüzyıl"],["18th century","20th century","15th century","21st century"],1,"Yapım aşamaları 1933–1953 dönemindedir.","Construction phases fall between 1933 and 1953."),
  question("Bu bina hangi tür kamusal kurumlarla bağlantılıdır?","Which public functions has this building served?",["Deniz ticareti","Kutsal hac","Hükümet ve parlamento","Arkeolojik kazı"],["Maritime trade","Pilgrimage","Government and parliament","Archaeology"],2,"Yapının geçmişi yönetim ve parlamento işlevleriyle ilişkilidir.","The building's history is associated with government and parliamentary functions.")
 ],
 },
 {
 id:"history-unl-paraninfo",difficulty:"medium",panoramaId:"p900aa414f2800c9c078b9a13",
 monument:msg("Santa Fe Üniversitesi Tarihî Paraninfo Salonu","Historic Paraninfo Hall, Santa Fe University"),place:msg("Santa Fe, Arjantin","Santa Fe, Argentina"),era:msg("1919–1935 · 20. yüzyıl","1919–1935 · 20th century"),tradition:msg("Üniversite reformu ve kamusal tartışma","University reform and public debate"),purpose:msg("Üniversite törenleri ve anayasa toplantıları","University ceremonies and constitutional conventions"),
 clue:msg("Tören salonunun oturma düzenini, kürsüyü ve akademik iç mekân ayrıntılarını incele.","Examine the auditorium seating, speaker's stage and academic interior."),fact:msg("1919'da kurulan Universidad Nacional del Litoral'in tarihî Paraninfo salonu, 1957 ve 1994 yıllarındaki anayasa kurucu meclisi toplantılarına ev sahipliği yaptı.","Founded in 1919, the National University of the Littoral hosted constitutional convention sessions in its historic Paraninfo hall in 1957 and 1994."),sourceUrl:"https://www.unl.edu.ar/international/categorias/aboutunl/history/",
 questions:[
  question("Bu tarihî salonun bağlı olduğu üniversite hangi yıl kuruldu?","When was the university associated with this historic hall established?",["1919","1819","2001","1640"],["1919","1819","2001","1640"],0,"Universidad Nacional del Litoral 1919'da kuruldu.","The National University of the Littoral was established in 1919."),
  question("Salon hangi iki yılda anayasa kurucu meclisi toplantılarına ev sahipliği yaptı?","Which two years saw constitutional convention sessions in this hall?",["1900 ve 1910","1957 ve 1994","2002 ve 2020","1789 ve 1799"],["1900 and 1910","1957 and 1994","2002 and 2020","1789 and 1799"],1,"Paraninfo 1957 ve 1994 anayasa toplantılarında kullanıldı.","The hall was used for constitutional conventions in 1957 and 1994."),
  question("Bu salonun ana tarihî ilişkisi hangisidir?","Which activity is most closely associated with this hall?",["Askerî savunma","Gemi yapımı","Üniversite ve anayasal tartışmalar","Antik ritüeller"],["Military defense","Shipbuilding","Academic and constitutional gatherings","Ancient rituals"],2,"Salon akademik ve anayasal toplantıların tarihine tanıklık etti.","The hall has hosted academic and constitutional events.")
 ],
 },
 {
 id:"history-guadalajara",difficulty:"medium",panoramaId:"p9e6947f46abdfa9f6a1c3a4f",
 monument:msg("Guadalajara Tarihî Kent Merkezi","Historic Center of Guadalajara"),place:msg("Guadalajara, Meksika","Guadalajara, Mexico"),era:msg("1542'den bugüne · Sömürge dönemi şehir dokusu","From 1542 · Colonial-era urban fabric"),tradition:msg("İspanyol sömürge dönemi kent mimarisi","Spanish colonial urban architecture"),purpose:msg("Dinî, kamusal ve ticari kent merkezi","Religious, civic and commercial city center"),
 clue:msg("Gece ışıklarında meydanları, yüksek cepheleri ve düzenli kent dokusunu incele.","Look for squares, tall facades and the urban grid visible in the night view."),fact:msg("1542'de bugünkü yerinde kurulan Guadalajara'nın tarihî merkezinde katedral, tiyatro ve çeşitli dönemlerden sivil yapılar bulunur.","Founded on its present site in 1542, Guadalajara's historic center includes a cathedral, theater and civic landmarks."),sourceUrl:"https://www.cultura.gob.mx/turismocultural/publi/Guias_conaculta_raices/Ingles/jalisco.pdf",
 questions:[
  question("Bu şehir bugünkü yerinde hangi yılda kuruldu?","In what year was this city founded at its current location?",["1542","1908","2005","MÖ 450"],["1542","1908","2005","450 BCE"],0,"Guadalajara bugünkü yerinde 1542'de kuruldu.","Guadalajara was founded at its present site in 1542."),
  question("Tarihî merkezde görülebilecek başlıca yapı türü hangisidir?","Which landmark is characteristic of its historic center?",["Roma amfitiyatrosu","Katedral ve kamusal meydan","Maya piramidi","Tibet manastırı"],["Roman amphitheater","Cathedral and civic squares","Maya pyramid","Tibetan monastery"],1,"Tarihî kent merkezinde katedral ve çok sayıda meydan bulunur.","The historic center includes a cathedral and public squares."),
  question("Bu tarihî kent merkezi hangi tarihsel mimari mirasla bağlantılıdır?","With which architectural heritage is this historic center linked?",["Viking yerleşimi","Japon Şinto mimarisi","İspanyol sömürge dönemi","Antik Mezopotamya"],["Viking settlement","Japanese Shinto","Spanish colonial era","Ancient Mesopotamia"],2,"Şehrin merkezinde sömürge dönemi kentsel mirası bulunur.","The city center preserves colonial-era urban heritage.")
 ],
 }
];
