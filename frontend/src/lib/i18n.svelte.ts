import { STORAGE_KEYS } from './constants';
export type Locale = 'pt-PT' | 'en-GB';

export const translations: Record<Locale, Record<string, string>> = {
  'pt-PT': {
    // Auth Page
    'auth.title': 'Contador • Iniciar Sessão',
    'auth.description': 'Inicie sessão, registe-se ou entre em modo de demonstração para começar a contar.',
    'auth.tagline': 'Para contar coisas',
    'auth.firebaseNotConnected': 'O Firebase não está ligado. Será iniciada uma sessão local.',
    'auth.signIn': 'Iniciar Sessão',
    'auth.register': 'Registar',
    'auth.createAccount': 'Criar Conta',
    'auth.username': 'Nome de utilizador',
    'auth.password': 'Palavra-passe',
    'auth.usernamePlaceholder': 'ex: utilizador',
    'auth.connecting': 'A ligar...',
    'auth.playDemo': 'Usar sem conta (armazenamento local)',
    'auth.guest': 'Convidado',
    'auth.error.fieldsRequired': 'Por favor, preencha todos os campos.',
    'auth.error.invalidUsername': 'O nome de utilizador deve conter apenas letras, números ou sublinhados, ter pelo menos 2 caracteres, e não começar por um número.',
    'auth.error.authFailed': 'Falha na autenticação.',
    'auth.error.demoFailed': 'Falha ao entrar no modo de demonstração.',

    // Counters Main Layout & Headers
    'counters.title': 'Contadores',
    'counters.searchPlaceholder': 'Procurar contadores...',
    'counters.gridView': 'Vista em grelha',
    'counters.listView': 'Vista em lista',
    'counters.counterName': 'Nome do Contador',
    'counters.value': 'Valor',
    'counters.quickIncrements': 'Incrementos/decrementos rápidos',
    'counters.actionsControls': 'Ações & Controlos',
    'counters.noCounters': 'Nenhum contador registado.',
    'counters.createCounter': 'Criar novo contador',
    'counters.activityLogs': 'Histórico de atividade',
    'counters.signOut': 'Terminar Sessão',
    'counters.undo': 'Desfazer',
    'counters.redo': 'Refazer',
    'counters.adjust': 'Ajustar:',
    'counters.valueLabel': 'Valor:',
    'counters.undoTooltip': 'Desfazer última ação',
    'counters.redoTooltip': 'Refazer última ação',
    'counters.settingsTooltip': 'Definições do contador',
    'counters.deleteTooltip': 'Eliminar contador',
    'counters.customAdjust': 'Incr/decremento personalizado',
    'counters.setValue': 'Definir valor',
    'counters.viewActivityLog': 'Ver Registo de Atividade',
    'counters.last': 'Último:',
    'counters.moreActions': 'Mais Ações',
    'counters.setExactValue': 'Definir Valor Exato',
    'counters.deleteCounter': 'Eliminar Contador',
    'counters.initializing': 'A iniciar interface...',
    'counters.redirecting': 'A redirecionar...',

    // General Modals
    'modals.cancel': 'Cancelar',
    'modals.create': 'Criar',
    'modals.save': 'Guardar',
    'modals.close': 'Fechar',
    'modals.add': 'Adicionar',
    'modals.remove': 'Remover',

    // Settings Modal
    'settings.title': 'Definições do Contador',
    'settings.nameLabel': 'Nome do Contador *',
    'settings.namePlaceholder': 'ex: Cafés mensais, Treinos',
    'settings.unitLabel': 'Unidade',
    'settings.unitPlaceholder': 'ex: L, €, km',
    'settings.decimalPrecision': 'Casas decimais',
    'settings.integer': 'Int',
    'settings.quickIncrements': 'Incrementos Rápidos',
    'settings.defaultIncrements': 'Incrementos Padrão',
    'settings.addIncrement': 'Adicionar Botão de Incremento',
    'settings.saveSettings': 'Guardar Definições',
    'settings.error.nameRequired': 'O nome do contador é obrigatório.',
    'settings.error.incrementsCount': 'Deve ter entre 1 e 3 incrementos padrão.',
    'settings.error.failedUpdate': 'Falha ao atualizar as definições.',

    // Create Modal
    'create.title': 'Novo Contador',
    'create.createCounter': 'Criar Contador',
    'create.error.failedCreate': 'Falha ao criar o contador.',

    // Delete Modal
    'delete.title': 'Eliminar Contador',
    'delete.confirmText': 'Eliminar Permanentemente',
    'delete.body': 'Tem a certeza de que deseja eliminar "{name}"?',
    'delete.disclaimer': 'Esta ação não pode ser desfeita. A configuração do contador e o seu valor serão eliminados permanentemente, embora o registo de histórico de atividade mantenha o registo de eliminação.',

    // Logout Modal
    'logout.title': 'Aviso: Perda de Dados',
    'logout.confirmText': 'Sim, Eliminar & Terminar Sessão',
    'logout.body1': 'Está atualmente a utilizar a aplicação no <strong>Modo Anónimo</strong>. Os seus dados estão armazenados localmente neste dispositivo.',
    'logout.body2': 'Terminar a sessão irá <strong>eliminar permanentemente todos os seus contadores e registos de histórico</strong>. Esta ação não pode ser desfeita.',

    // Custom Adjust Modal
    'custom.title': 'Ajuste Personalizado',
    'custom.body': 'Escolha o quanto deseja ajustar o contador "{name}".',
    'custom.increment': 'Incrementar (+)',
    'custom.decrement': 'Decrementar (-)',
    'custom.amountLabel': 'Valor do Ajuste ({unit})',
    'custom.applyAddition': 'Aplicar Adição',
    'custom.applySubtraction': 'Aplicar Subtração',

    // Set Exact Value Modal
    'exact.title': 'Definir Valor Exato',
    'exact.body': 'Atualize o valor do contador "{name}" diretamente.',
    'exact.valueLabel': 'Novo Valor ({unit})',
    'exact.saveValue': 'Guardar Valor',

    // History Modal
    'history.title': 'Histórico de Atividade',
    'history.titleCounter': 'Atividade de {name}',
    'history.subtitle': 'Registo de ajustes de valor e eventos',
    'history.subtitleCounter': 'Registo de eventos para este contador',
    'history.searchPlaceholder': 'Procurar por nome do contador...',
    'history.searchPlaceholderCounter': 'Procurar alterações...',
    'history.noHistory': 'Nenhum histórico de atividade registado.',
    'history.clearSearch': 'Tente limpar a sua consulta de pesquisa.',
    'history.loadMore': 'Carregar Mais',

    // Methods and dynamic logs
    'history.method.creation': 'Criação',
    'history.method.settingsUpdate': 'Definições',
    'history.method.deletion': 'Eliminação',
    'history.method.quickAdjust': 'Ajuste Rápido',
    'history.method.customAdjust': 'Ajuste Personaliz.',
    'history.method.directSet': 'Definição Direta',
    'history.method.undo': 'Desfazer',
    'history.method.redo': 'Refazer',

    // Log descriptions
    'log.created': 'Criou o contador "{name}" com unidade "{unit}"',
    'log.updated': 'Atualizou as definições do contador "{name}"',
    'log.deleted': 'Eliminou o contador "{name}"',
    'log.quickInc': 'Incremento rápido de +{val} {unit}',
    'log.quickDec': 'Decremento rápido de -{val} {unit}',
    'log.customInc': 'Ajuste personalizado de +{val} {unit}',
    'log.customDec': 'Ajuste personalizado de -{val} {unit}',
    'log.directSet': 'Definiu o valor diretamente para {val} {unit}',
    'log.undo': 'Desfazer: Reverteu "{desc}"',
    'log.redo': 'Refazer: Reaplicou "{desc}"',

    // Themes tooltips
    'theme.lightTooltip': 'Mudar para Modo Claro',
    'theme.darkTooltip': 'Mudar para Modo Escuro',

    // Language Selector
    'language.select': 'Mudar idioma',
    'language.pt': 'Português',
    'language.en': 'English'
  },
  'en-GB': {
    // Auth Page
    'auth.title': 'Contador • Sign In',
    'auth.description': 'Sign in, sign up, or launch a demo session to start tracking with Contador.',
    'auth.tagline': 'To count things',
    'auth.firebaseNotConnected': 'Firebase is not connected yet. You will be logged into a local session.',
    'auth.signIn': 'Sign In',
    'auth.register': 'Register',
    'auth.createAccount': 'Create Account',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.usernamePlaceholder': 'e.g., username',
    'auth.connecting': 'Connecting...',
    'auth.playDemo': 'Use without an account (local storage)',
    'auth.guest': 'Guest',
    'auth.error.fieldsRequired': 'Please fill out all fields.',
    'auth.error.invalidUsername': 'Username must start with a letter or underscore, contain only letters, numbers, or underscores, and be at least 2 characters long.',
    'auth.error.authFailed': 'Authentication failed.',
    'auth.error.demoFailed': 'Demo mode entrance failed.',

    // Counters Main Layout & Headers
    'counters.title': 'Counters',
    'counters.searchPlaceholder': 'Search counters...',
    'counters.gridView': 'Grid view',
    'counters.listView': 'List view',
    'counters.counterName': 'Counter Name',
    'counters.value': 'Value',
    'counters.quickIncrements': 'Quick Increments',
    'counters.actionsControls': 'Actions & Controls',
    'counters.noCounters': 'No counters found.',
    'counters.createCounter': 'Create new counter',
    'counters.activityLogs': 'Activity logs',
    'counters.signOut': 'Sign Out',
    'counters.undo': 'Undo',
    'counters.redo': 'Redo',
    'counters.adjust': 'Adjust:',
    'counters.valueLabel': 'Value:',
    'counters.undoTooltip': 'Undo last action',
    'counters.redoTooltip': 'Redo last action',
    'counters.settingsTooltip': 'Counter Settings',
    'counters.deleteTooltip': 'Delete counter',
    'counters.customAdjust': 'Custom Adjust',
    'counters.setValue': 'Set Value',
    'counters.viewActivityLog': 'View Activity Log',
    'counters.last': 'Last:',
    'counters.moreActions': 'More Actions',
    'counters.setExactValue': 'Set Exact Value',
    'counters.deleteCounter': 'Delete Counter',
    'counters.initializing': 'Initializing Interface...',
    'counters.redirecting': 'Redirecting...',

    // General Modals
    'modals.cancel': 'Cancel',
    'modals.create': 'Create',
    'modals.save': 'Save',
    'modals.close': 'Close',
    'modals.add': 'Add',
    'modals.remove': 'Remove',

    // Settings Modal
    'settings.title': 'Counter Settings',
    'settings.nameLabel': 'Counter Name *',
    'settings.namePlaceholder': 'e.g. Water Intake, Daily Steps',
    'settings.unitLabel': 'Unit (free text)',
    'settings.unitPlaceholder': 'e.g. Liters, reps, cups, km',
    'settings.decimalPrecision': 'Decimal Precision',
    'settings.integer': 'Int',
    'settings.quickIncrements': 'Quick Increments',
    'settings.defaultIncrements': 'Default Increments',
    'settings.addIncrement': 'Add Increment Button',
    'settings.saveSettings': 'Save Settings',
    'settings.error.nameRequired': 'Counter name is required.',
    'settings.error.incrementsCount': 'You must have between 1 and 3 default increments.',
    'settings.error.failedUpdate': 'Failed to update settings.',

    // Create Modal
    'create.title': 'New Counter',
    'create.createCounter': 'Create Counter',
    'create.error.failedCreate': 'Failed to create counter.',

    // Delete Modal
    'delete.title': 'Delete Counter',
    'delete.confirmText': 'Delete Permanently',
    'delete.body': 'Are you sure you want to delete "{name}"?',
    'delete.disclaimer': 'This action cannot be undone. Its counter configuration and value will be permanently deleted, though the activity history log will retain the deletion record.',

    // Logout Modal
    'logout.title': 'Warning: Data Loss',
    'logout.confirmText': 'Yes, Delete & Logout',
    'logout.body1': 'You are currently using the application in <strong>Anonymous Mode</strong>. Your data is stored locally on this device.',
    'logout.body2': 'Logging out will <strong>permanently delete all of your counters and history logs</strong>. This action cannot be undone.',

    // Custom Adjust Modal
    'custom.title': 'Custom Adjustment',
    'custom.body': 'Choose how much to adjust the counter "{name}" by.',
    'custom.increment': 'Increment (+)',
    'custom.decrement': 'Decrement (-)',
    'custom.amountLabel': 'Adjustment Amount ({unit})',
    'custom.applyAddition': 'Apply Addition',
    'custom.applySubtraction': 'Apply Subtraction',

    // Set Exact Value Modal
    'exact.title': 'Set Exact Value',
    'exact.body': 'Update the counter "{name}" directly.',
    'exact.valueLabel': 'New Value ({unit})',
    'exact.saveValue': 'Save Value',

    // History Modal
    'history.title': 'Activity History',
    'history.titleCounter': '{name} Activity',
    'history.subtitle': 'Log of value adjustments and events',
    'history.subtitleCounter': 'Log of events for this counter',
    'history.searchPlaceholder': 'Search by counter name...',
    'history.searchPlaceholderCounter': 'Search changes...',
    'history.noHistory': 'No activity history recorded.',
    'history.clearSearch': 'Try clearing your search query.',
    'history.loadMore': 'Load More',

    // Methods and dynamic logs
    'history.method.creation': 'Creation',
    'history.method.settingsUpdate': 'Settings',
    'history.method.deletion': 'Deletion',
    'history.method.quickAdjust': 'Quick Adjust',
    'history.method.customAdjust': 'Custom Adjust',
    'history.method.directSet': 'Direct Set',
    'history.method.undo': 'Undo',
    'history.method.redo': 'Redo',

    // Log descriptions
    'log.created': 'Created counter "{name}" with unit "{unit}"',
    'log.updated': 'Updated settings of counter "{name}"',
    'log.deleted': 'Deleted counter "{name}"',
    'log.quickInc': 'Quick incremented by +{val} {unit}',
    'log.quickDec': 'Quick decremented by -{val} {unit}',
    'log.customInc': 'Adjusted custom by +{val} {unit}',
    'log.customDec': 'Adjusted custom by -{val} {unit}',
    'log.directSet': 'Set value directly to {val} {unit}',
    'log.undo': 'Undo: Reverted "{desc}"',
    'log.redo': 'Redo: Reapplied "{desc}"',

    // Themes tooltips
    'theme.lightTooltip': 'Switch to Light Mode',
    'theme.darkTooltip': 'Switch to Dark Mode',

    // Language Selector
    'language.select': 'Change language',
    'language.pt': 'Português',
    'language.en': 'English'
  }
};

class I18nStore {
  locale = $state<Locale>('pt-PT');

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.LOCALE);
      if (saved === 'pt-PT' || saved === 'en-GB') {
        this.locale = saved as Locale;
      } else {
        this.locale = this.detectLocale();
      }
    }
  }

  detectLocale(): Locale {
    if (typeof window === 'undefined') return 'pt-PT';

    const langs = navigator.languages || [navigator.language];
    for (const lang of langs) {
      const lower = lang.toLowerCase();
      if (lower.startsWith('pt')) {
        return 'pt-PT';
      }
      if (lower.startsWith('en')) {
        return 'en-GB';
      }
    }
    return 'pt-PT'; // Default to pt (which translates to pt-PT)
  }

  setLocale(newLocale: Locale) {
    this.locale = newLocale;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LOCALE, newLocale);
    }
  }

  translate(key: string, replacements?: Record<string, string | number>): string {
    const dict = translations[this.locale];
    let template = dict[key] || translations['pt-PT'][key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        template = template.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    return template;
  }
}

export const i18n = new I18nStore();
export const t = (key: string, replacements?: Record<string, string | number>) => i18n.translate(key, replacements);
