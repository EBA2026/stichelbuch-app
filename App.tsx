
import React, { useState, useEffect, useMemo } from 'react';
import { APP_DATA } from './data';
import { AppState, AppView, InsiderStory } from './types';
import { 
  ChevronLeft, 
  Search, 
  Heart, 
  CheckCircle, 
  Shuffle, 
  Moon, 
  Sun, 
  Lock,
  ArrowRight,
  User,
  Edit3,
  Trash2,
  Plus,
  Save,
  X,
  Layers,
  Users,
  LogOut,
  Sparkles
} from 'lucide-react';

const STATIC_PASSWORD = "Hundegesicht";
// Get persons and sort them alphabetically
const PERSONS = [...APP_DATA.persons].sort((a, b) => a.localeCompare(b)) as Array<'Erhan' | 'Orhan' | 'Soufiane' | 'Fatih' | 'Andre'>;

const App: React.FC = () => {
  const [stories, setStories] = useState<InsiderStory[]>(() => {
    const savedStories = localStorage.getItem('stichelbuch_stories');
    return savedStories ? JSON.parse(savedStories) : APP_DATA.insiders;
  });

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('stichelbuch_state');
    const initial = saved ? JSON.parse(saved) : {
      view: 'login',
      selectedPerson: null,
      selectedStoryId: null,
      isLoggedIn: false,
      favorites: [],
      readStatus: [],
      darkMode: false 
    };
    return initial;
  });

  const [editFormData, setEditFormData] = useState<Partial<InsiderStory>>({});
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem('stichelbuch_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('stichelbuch_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-slate-950', 'text-slate-100');
      document.body.classList.remove('bg-slate-100', 'text-slate-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('bg-slate-100', 'text-slate-900');
      document.body.classList.remove('bg-slate-950', 'text-slate-100');
    }
  }, [state.darkMode]);

  const handleLogin = () => {
    if (passwordInput === STATIC_PASSWORD) {
      setState(prev => ({ ...prev, isLoggedIn: true, view: 'home' }));
      setLoginError(false);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const handleLogout = () => {
    if (confirm("Möchtest du dich wirklich ausloggen?")) {
      setState(prev => ({ 
        ...prev, 
        isLoggedIn: false, 
        view: 'login',
        selectedPerson: null,
        selectedStoryId: null 
      }));
      setPasswordInput('');
      setSearchTerm('');
    }
  };

  const navigateTo = (view: AppView, person: string | null = null, storyId: string | null = null) => {
    setState(prev => ({
      ...prev,
      view,
      selectedPerson: person,
      selectedStoryId: storyId
    }));
    window.scrollTo(0, 0);
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setState(prev => ({
      ...prev,
      favorites: prev.favorites.includes(id) 
        ? prev.favorites.filter(f => f !== id)
        : [...prev.favorites, id]
    }));
  };

  const toggleReadStatus = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setState(prev => ({
      ...prev,
      readStatus: prev.readStatus.includes(id) 
        ? prev.readStatus.filter(r => r !== id)
        : [...prev.readStatus, id]
    }));
  };

  const surpriseMe = () => {
    const visibleStories = stories.filter(i => i.visible !== false);
    if (visibleStories.length === 0) return;
    const randomStory = visibleStories[Math.floor(Math.random() * visibleStories.length)];
    navigateTo('story', randomStory.person, randomStory.id);
  };

  const handleSaveStory = () => {
    if (!editFormData.term || !editFormData.person || !editFormData.story) {
      alert("Bitte fülle alle Pflichtfelder aus.");
      return;
    }

    if (editFormData.id) {
      setStories(prev => prev.map(s => s.id === editFormData.id ? (editFormData as InsiderStory) : s));
      navigateTo('story', editFormData.person, editFormData.id);
    } else {
      const newId = Date.now().toString();
      const newStory: InsiderStory = {
        ...editFormData,
        id: newId,
        visible: true,
        order: stories.length + 1
      } as InsiderStory;
      setStories(prev => [...prev, newStory]);
      navigateTo('story', newStory.person, newId);
    }
    setEditFormData({});
  };

  const handleDeleteStory = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm("Möchtest du diesen Insider wirklich unwiderruflich löschen?")) {
      setStories(prev => prev.filter(s => s.id !== id));
      setState(prev => ({
        ...prev,
        favorites: prev.favorites.filter(fid => fid !== id),
        readStatus: prev.readStatus.filter(rid => rid !== id)
      }));
      if (state.view === 'story') {
        navigateTo('terms', state.selectedPerson);
      }
    }
  };

  const startEditing = (story: InsiderStory, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditFormData(story);
    navigateTo('editor');
  };

  const startNewStory = (personPref: string | null = null) => {
    setEditFormData({
      person: (personPref as any) || PERSONS[0],
      category: "Allgemein",
      term: "",
      story: ""
    });
    navigateTo('editor');
  };

  const filteredStories = useMemo(() => {
    return stories.filter(i => {
      const matchesPerson = !state.selectedPerson || i.person === state.selectedPerson;
      const matchesSearch = !searchTerm || 
        i.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
        i.category.toLowerCase().includes(searchTerm.toLowerCase());
      const isVisible = i.visible !== false;
      return matchesPerson && matchesSearch && isVisible;
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [state.selectedPerson, searchTerm, stories]);

  const currentStory = useMemo(() => {
    return stories.find(i => i.id === state.selectedStoryId);
  }, [state.selectedStoryId, stories]);

  // --- Screens ---

  if (!state.isLoggedIn || state.view === 'login') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in bg-slate-100 dark:bg-slate-950 transition-colors duration-700">
        <div className="w-full max-w-lg text-center transform transition-transform duration-1000 scale-100 md:scale-110">
          <h1 className="text-5xl md:text-7xl font-light serif mb-4 text-slate-900 dark:text-slate-100 tracking-tighter">STICHELBuch 2.0</h1>
          
          <p className="text-slate-500 dark:text-slate-400 font-light italic mb-12 max-w-md mx-auto leading-relaxed">
            Nur für Eingeweihte: STICHELBuch 2.0 flüstert dir die geheimsten Storys. Bereit?
          </p>

          <div className="w-full max-w-sm mx-auto space-y-6">
            <div className="relative group">
              <input 
                type="password"
                placeholder="Passwort eingeben..."
                className={`w-full bg-transparent border-b-2 px-6 py-4 outline-none transition-all duration-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-lg ${loginError ? 'border-red-500' : 'border-slate-300 dark:border-slate-800 focus:border-slate-900 dark:focus:border-slate-100'}`}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                autoFocus
              />
              <Lock className="absolute right-4 top-4.5 w-5 h-5 text-slate-300 dark:text-slate-700 group-focus-within:text-slate-900 dark:group-focus-within:text-slate-100 transition-colors" />
            </div>
            
            <button 
              onClick={handleLogin}
              className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.97] shadow-xl shadow-slate-300 dark:shadow-none"
            >
              Eintreten <ArrowRight className="w-5 h-5" />
            </button>
            
            {loginError && (
              <p className="text-red-500 text-sm font-bold tracking-widest uppercase animate-pulse">Zugriff verweigert.</p>
            )}
          </div>
          
          <div className="mt-24 text-slate-400 dark:text-slate-800 text-[10px] uppercase font-black tracking-[0.4em] opacity-60">
            Von Hundegesicht für Hundegesicht 2026
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-6 pb-24 pt-8 transition-colors duration-500 text-center">
      {/* Header */}
      <header className="flex items-center justify-between mb-16">
        <div 
          className="cursor-pointer group" 
          onClick={() => navigateTo('home')}
        >
          <h2 className="text-2xl font-black tracking-tighter serif text-slate-900 dark:text-slate-100 transition-all group-hover:scale-105">Stichelbuch 2.0</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => startNewStory()}
            className="p-3 bg-slate-200/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-800"
            title="Neu erstellen"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setState(prev => ({ ...prev, darkMode: !prev.darkMode }))} 
            className="p-3 bg-slate-200/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-800"
            title="Design wechseln"
          >
            {state.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={handleLogout} 
            className="p-3 bg-slate-200/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-red-500 border border-transparent dark:border-slate-800"
            title="Ausloggen"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* View: Home */}
      {state.view === 'home' && (
        <div className="animate-in fade-in zoom-in duration-700 flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-3xl md:text-5xl font-light mb-16 serif text-slate-900 dark:text-slate-100 text-center whitespace-nowrap tracking-tight">
            Wähle. Jetzt. Los. <span className="font-bold">Tu es!</span>
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mx-auto">
            <button
              onClick={() => navigateTo('terms', null)}
              className="group flex flex-col items-center p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-100 transition-all hover:-translate-y-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center mb-6 text-white dark:text-slate-900 shadow-md group-hover:rotate-6 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 mb-2 uppercase">Insider</h3>
              <p className="text-slate-400 text-sm font-medium text-center">Alle Insider auf einen Blick</p>
            </button>

            <button
              onClick={() => navigateTo('persons_list')}
              className="group flex flex-col items-center p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-100 transition-all hover:-translate-y-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-100 flex items-center justify-center mb-6 text-slate-900 dark:text-slate-100 shadow-md group-hover:-rotate-6 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 mb-2 uppercase">Person</h3>
              <p className="text-slate-400 text-sm font-medium text-center">Insider nach Hundegesicht</p>
            </button>

            <button
              onClick={surpriseMe}
              className="group flex flex-col items-center p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-100 transition-all hover:-translate-y-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center mb-6 text-white shadow-md group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 mb-2 uppercase">Zufall</h3>
              <p className="text-slate-400 text-sm font-medium text-center">Insider per Zufallsprinzip</p>
            </button>
          </div>
        </div>
      )}

      {/* View: Persons List */}
      {state.view === 'persons_list' && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 max-w-2xl mx-auto text-left">
          <button 
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-10 font-bold uppercase tracking-widest text-xs"
          >
            <ChevronLeft className="w-4 h-4" /> Hauptmenü
          </button>
          <h1 className="text-4xl font-light mb-10 serif text-slate-900 dark:text-slate-100">Das Line-up</h1>
          <div className="grid gap-4">
            {PERSONS.map(person => (
              <button
                key={person}
                onClick={() => navigateTo('terms', person)}
                className="group flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-lg border border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-100 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <User className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                  </div>
                  <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-slate-100">{person}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 group-hover:translate-x-2 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View: Terms */}
      {state.view === 'terms' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto text-left">
          <div className="flex justify-between items-center mb-12">
            <button 
              onClick={() => state.selectedPerson ? navigateTo('persons_list') : navigateTo('home')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-bold uppercase tracking-widest text-xs"
            >
              <ChevronLeft className="w-4 h-4" /> Zurück
            </button>
            <button 
              onClick={() => startNewStory(state.selectedPerson)}
              className="flex items-center gap-2 text-xs font-black bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-full hover:scale-105 transition-all shadow-lg active:scale-95 uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" /> Hinzufügen
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-10 gap-2">
            <h1 className="text-4xl md:text-5xl font-light serif italic text-slate-900 dark:text-slate-100">
              {state.selectedPerson || "Archiv"}
            </h1>
            <span className="text-xs text-slate-500 uppercase font-black tracking-[0.2em]">
              {filteredStories.length} Einträge
            </span>
          </div>

          <div className="relative mb-10">
            <input 
              type="text"
              placeholder="Begriffe durchsuchen..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 ring-slate-900/10 dark:ring-slate-100/10 transition-all text-lg text-slate-900 dark:text-slate-100 shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-4.5 w-5 h-5 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStories.map(story => (
              <div
                key={story.id}
                onClick={() => navigateTo('story', story.person, story.id)}
                className="group relative p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-100 cursor-pointer transition-all flex flex-col gap-3 shadow-md hover:shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{story.category}</span>
                    {!state.selectedPerson && (
                      <span className="text-[9px] font-black bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-0.5 rounded-full uppercase">
                        {story.person}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => startEditing(story, e)}
                      className="p-1.5 text-slate-300 hover:text-blue-500 transition-colors"
                      title="Editieren"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteStory(story.id, e)}
                      className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight pr-8">{story.term}</h3>
                
                <div className="absolute bottom-6 right-6 flex gap-2">
                  {state.favorites.includes(story.id) && <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />}
                  {state.readStatus.includes(story.id) && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
              </div>
            ))}
            {filteredStories.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-400 font-serif italic text-2xl opacity-50">
                Keine Spuren...
              </div>
            )}
          </div>
        </div>
      )}

      {/* View: Story */}
      {state.view === 'story' && currentStory && (
        <div className="animate-in fade-in slide-in-from-right-6 duration-500 max-w-3xl mx-auto text-left">
          <div className="flex justify-between items-center mb-10">
            <button 
              onClick={() => navigateTo('terms', state.selectedPerson)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-bold uppercase tracking-widest text-xs"
            >
              <ChevronLeft className="w-4 h-4" /> Liste
            </button>
            <div className="flex gap-3">
              <button 
                onClick={(e) => startEditing(currentStory, e)}
                className="p-3 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all text-slate-500 hover:text-blue-600 border border-slate-200 dark:border-slate-800"
                title="Bearbeiten"
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button 
                onClick={(e) => handleDeleteStory(currentStory.id, e)}
                className="p-3 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all text-slate-500 hover:text-red-600 border border-slate-200 dark:border-slate-800"
                title="Löschen"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <article className="bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800">
            <header className="mb-16 flex flex-col items-center text-center">
              <span className="inline-block px-5 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full text-[10px] uppercase font-black tracking-[0.2em] mb-8">
                {currentStory.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-black serif mb-8 text-slate-900 dark:text-slate-100 leading-tight tracking-tighter">{currentStory.term}</h1>
              <div className="flex items-center gap-4 text-slate-400 font-serif italic text-xl">
                <span className="w-12 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
                Insider von <span className="text-slate-900 dark:text-slate-100 font-bold not-italic px-3">{currentStory.person}</span>
                <span className="w-12 h-[1px] bg-slate-200 dark:border-slate-800"></span>
              </div>
            </header>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-xl md:text-2xl leading-relaxed font-light text-slate-800 dark:text-slate-100 first-letter:text-7xl first-letter:font-black first-letter:serif first-letter:float-left first-letter:mr-4 first-letter:text-slate-900 dark:first-letter:text-white">
                {currentStory.story}
              </p>
            </div>

            <footer className="mt-20 pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="flex gap-4">
                <button 
                  onClick={(e) => toggleFavorite(currentStory.id, e)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all font-black text-sm uppercase tracking-widest ${state.favorites.includes(currentStory.id) ? 'bg-red-600 border-red-600 text-white' : 'border-slate-100 dark:border-slate-800 hover:border-red-500 text-slate-900 dark:text-slate-100'}`}
                >
                  <Heart className={`w-4 h-4 ${state.favorites.includes(currentStory.id) ? 'fill-current' : ''}`} />
                  {state.favorites.includes(currentStory.id) ? 'Gemerkt' : 'Merken'}
                </button>
                
                <button 
                  onClick={(e) => toggleReadStatus(currentStory.id, e)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all font-black text-sm uppercase tracking-widest ${state.readStatus.includes(currentStory.id) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-100 dark:border-slate-800 hover:border-emerald-500 text-slate-900 dark:text-slate-100'}`}
                >
                  <CheckCircle className={`w-4 h-4 ${state.readStatus.includes(currentStory.id) ? 'fill-current' : ''}`} />
                  {state.readStatus.includes(currentStory.id) ? 'Gelesen' : 'Gelesen?'}
                </button>
              </div>

              <div className="text-[10px] uppercase font-black tracking-widest text-slate-300 dark:text-slate-700">
                ID: #{currentStory.id.padStart(4, '0')}
              </div>
            </footer>
          </article>
        </div>
      )}

      {/* View: Editor */}
      {state.view === 'editor' && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 max-w-2xl mx-auto text-left">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-light serif text-slate-900 dark:text-slate-100">Editor</h1>
            <button 
              onClick={() => {
                if (editFormData.id) navigateTo('story', editFormData.person, editFormData.id);
                else navigateTo('terms', state.selectedPerson);
              }}
              className="p-3 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-full border border-slate-200 dark:border-slate-800 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 space-y-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Subjekt</label>
              <select 
                className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-slate-900/5 transition-all text-xl text-slate-900 dark:text-slate-100 font-bold appearance-none cursor-pointer"
                value={editFormData.person}
                onChange={(e) => setEditFormData(prev => ({ ...prev, person: e.target.value as any }))}
              >
                {PERSONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Terminus</label>
              <input 
                type="text"
                placeholder="Name des Insiders"
                className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-slate-900/5 transition-all text-xl text-slate-900 dark:text-slate-100 font-bold"
                value={editFormData.term}
                onChange={(e) => setEditFormData(prev => ({ ...prev, term: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Klassifizierung</label>
              <input 
                type="text"
                placeholder="Kategorie"
                className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-slate-900/5 transition-all text-xl text-slate-900 dark:text-slate-100 font-bold"
                value={editFormData.category}
                onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Narrativ</label>
              <textarea 
                rows={6}
                placeholder="Die Geschichte..."
                className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-slate-900/5 transition-all resize-none text-xl text-slate-900 dark:text-slate-100 leading-relaxed font-light"
                value={editFormData.story}
                onChange={(e) => setEditFormData(prev => ({ ...prev, story: e.target.value }))}
              />
            </div>

            <button 
              onClick={handleSaveStory}
              className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] shadow-lg uppercase tracking-widest"
            >
              <Save className="w-6 h-6" /> Sichern
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-900 py-6 px-8 md:hidden z-10">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button onClick={() => navigateTo('home')} className={`p-2 transition-all ${state.view === 'home' ? 'text-slate-900 dark:text-slate-100 scale-125' : 'text-slate-400'}`}>
            <Layers className="w-6 h-6" />
          </button>
          <button onClick={() => navigateTo('persons_list')} className={`p-2 transition-all ${state.view === 'persons_list' ? 'text-slate-900 dark:text-slate-100 scale-125' : 'text-slate-400'}`}>
            <Users className="w-6 h-6" />
          </button>
          <button onClick={() => startNewStory()} className={`p-2 transition-all ${state.view === 'editor' && !editFormData.id ? 'text-slate-900 dark:text-slate-100 scale-125' : 'text-slate-400'}`}>
            <Plus className="w-6 h-6" />
          </button>
          <button onClick={surpriseMe} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <Shuffle className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
