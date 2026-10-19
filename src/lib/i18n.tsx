import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { languageNames, translations, type Language } from './i18nStrings';

export type { Language } from './i18nStrings';
export { languageNames } from './i18nStrings';
const STORAGE_KEY='atlas-arena-language-v1';
const supported=['tr','en','es','de','fr','pt','ru','zh','ja'] as const;

function matchLanguage(value:string): Language|null{
  const code=value.toLowerCase().split(/[-_]/)[0];
  return (supported as readonly string[]).includes(code) ? code as Language : null;
}
function initialLanguage():Language{
  try {
    const saved=localStorage.getItem(STORAGE_KEY);
    if(saved){
      const language=matchLanguage(saved);
      if(language)return language;
    }
  }catch{ /* Private browsing or disabled storage */ }
  // The user's preferred device languages, not their download region or GPS.
  for(const locale of navigator.languages ?? [navigator.language]){
    const found=matchLanguage(locale);
    if(found)return found;
  }
  return 'en';
}
interface I18nContext {
  language:Language;
  setLanguage:(language:Language)=>void;
  t:(text:string)=>string;
}
const context=createContext<I18nContext>({
  language:'tr',setLanguage:()=>{},t:(text)=>text
});
export function LanguageProvider({children}:{children:ReactNode}){
  const [language,setLanguage]=useState<Language>(initialLanguage);
  useEffect(()=>{
    try{localStorage.setItem(STORAGE_KEY,language);}catch{/* optional */}
    document.documentElement.lang=language==='zh'?'zh-CN':language==='pt'?'pt-BR':language;
    document.documentElement.dir='ltr';
    document.title='Atlas Arena';
  },[language]);
  const value=useMemo<I18nContext>(()=>{
    const t=(text:string)=>language==='tr' ? text
      : (translations[language]?.[text] ?? translations.en[text] ?? text);
    return {language,setLanguage,t};
  },[language]);
  return <context.Provider value={value}>{children}</context.Provider>;
}
export const useLanguage=()=>useContext(context);
export const availableLanguages=Object.entries(languageNames) as [Language,string][];
