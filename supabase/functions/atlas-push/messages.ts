// Do not translate via country/IP: use the language selected by this device.
export type NoticeKind = 'daily' | 'weekly';
const notices: Record<string, Record<NoticeKind, [string,string]>> = {
  tr:{daily:['🌍 Günlük 10 soru','Bugünkü coğrafya turuna katılmak ister misin?'],weekly:['🏆 Globriva haftalık ligi','Bu haftanın coğrafya yarışmasına katılmak ister misin?']},
  en:{daily:['🌍 Your daily 10 questions',"Ready for today's geography challenge?"],weekly:['🏆 Globriva Weekly League',"Ready for this week's geography league?"]},
  es:{daily:['🌍 Tus 10 preguntas diarias','¿Listo para el reto de geografía de hoy?'],weekly:['🏆 Liga semanal Globriva','¿Te unes al desafío geográfico de esta semana?']},
  de:{daily:['🌍 Deine 10 Tagesfragen','Bereit für die heutige Geografie-Challenge?'],weekly:['🏆 Globriva Wochenliga','Bereit für den Geografie-Wettbewerb dieser Woche?']},
  fr:{daily:['🌍 Tes 10 questions du jour','Prêt pour le défi géographique du jour ?'],weekly:['🏆 Ligue hebdomadaire Globriva','Prêt pour le tournoi de géographie de cette semaine ?']},
  pt:{daily:['🌍 Suas 10 perguntas diárias','Pronto para o desafio de geografia de hoje?'],weekly:['🏆 Liga semanal Globriva','Pronto para o desafio de geografia desta semana?']},
  ru:{daily:['🌍 Твои 10 вопросов на сегодня','Готовы к сегодняшней географической викторине?'],weekly:['🏆 Еженедельная лига Globriva','Готовы к географическому турниру этой недели?']},
  zh:{daily:['🌍 今日 10 道题','准备好迎接今天的地理挑战了吗？'],weekly:['🏆 Globriva 每周联赛','准备好参加本周的地理竞赛了吗？']},
  ja:{daily:['🌍 今日の10問','今日の地理チャレンジに挑戦しませんか？'],weekly:['🏆 Globriva 週間リーグ','今週の地理大会に参加しませんか？']}
};
export function notice(kind: NoticeKind, language: string){
  const pair=(notices[language]||notices.en)[kind];
  return {title:pair[0],body:pair[1],target:kind};
}
