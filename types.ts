
export interface LanguageDetail {
  word: string;
  pronunciation: string;
}

export interface RecognitionResult {
  english: LanguageDetail;
  korean: LanguageDetail;
  japanese: LanguageDetail;
  chinese: LanguageDetail;
  spanish: LanguageDetail;
  french: LanguageDetail;
  german: LanguageDetail;
  russian: LanguageDetail;
  hindi: LanguageDetail;
}

export enum AppStatus {
  IDLE = 'IDLE',
  CAPTURING = 'CAPTURING',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT'
}
