export type StudyLanguage = 'English' | 'Hindi';

const STORAGE_KEY = 'akh.language';
const CHANGE_EVENT = 'akh:language-change';

export function getStudyLanguage(): StudyLanguage {
  if (typeof window === 'undefined') return 'English';
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'Hindi' ? 'Hindi' : 'English';
  } catch {
    return 'English';
  }
}

export function setStudyLanguage(language: StudyLanguage) {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Private browsing can block storage; the change still applies for this session.
  }
  window.dispatchEvent(new CustomEvent<StudyLanguage>(CHANGE_EVENT, { detail: language }));
}

export function subscribeToStudyLanguage(listener: (language: StudyLanguage) => void): () => void {
  const handleChange = () => listener(getStudyLanguage());
  window.addEventListener(CHANGE_EVENT, handleChange);
  window.addEventListener('storage', handleChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handleChange);
    window.removeEventListener('storage', handleChange);
  };
}
