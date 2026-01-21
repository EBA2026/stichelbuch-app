
export interface InsiderStory {
  id: string;
  person: 'Erhan' | 'Orhan' | 'Soufiane' | 'Fatih' | 'Andre';
  term: string;
  category: string;
  story: string;
  visible?: boolean;
  order?: number;
}

export interface AppData {
  persons: string[];
  insiders: InsiderStory[];
}

export type AppView = 'login' | 'home' | 'persons_list' | 'terms' | 'story' | 'editor';

export interface AppState {
  view: AppView;
  selectedPerson: string | null;
  selectedStoryId: string | null;
  isLoggedIn: boolean;
  favorites: string[];
  readStatus: string[];
  darkMode: boolean;
}
