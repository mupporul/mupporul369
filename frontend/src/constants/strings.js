/**
 * All UI strings in Tamil (ta) and English (en).
 * Add new keys here; components consume them via useLang().
 */
const STRINGS = {
  ta: {
    // Tabs
    tabTemples: "கோவில்கள்",
    tabQuiz: "வினாடி வினா",
    tabReview: "பரிசீலனை",
    tabUsers: "பயனர்கள்",

    // Admin export/import
    exportBtn: "ஏற்றுமதி",
    importBtn: "இறக்குமதி",
    exportTemplesBtn: "கோவில்கள் பதிவிறக்கு",
    exportUsersBtn: "பயனர்கள் பதிவிறக்கு",

    // Filter bar
    rasiAll: "எல்லாம்",
    rasiAriaLabel: "ராசி தேர்வு",
    searchPlaceholder: "தேடுக...",
    searchAriaLabel: "கோவில் தேடுக",
    planetFilterAriaLabel: "கிரக வடிகட்டி",

    // Users
    usersBackupTitle: "தரவு காப்பு",
    usersBackupDescription:
      "அனைத்து .json கோப்புகளையும் பதிவிறக்கலாம் அல்லது மீண்டும் இறக்குமதி செய்யலாம்.",
    usersFileTypeError: "JSON கோப்புகளை மட்டும் இறக்குமதி செய்யலாம்",
    usersAddTitle: "புதிய பயனரை சேர்க்கவும்",
    usersAddSubmitBtn: "பயனர் சேர்",
    usersListTitle: "பயனர்கள் பட்டியல்",

    // Quiz
    quizEmpty: "வினாடி வினாவுக்கு கோவில் தரவு இல்லை",
    quizTabAriaLabel: "வினாடி வினா",
    quizQuestionLabel: "கேள்வி",
    quizScoreLabel: "மதிப்பெண்",
    quizTemplePrompt: "இந்த கோவிலுக்கு சரியான கிரக இணைப்பைத் தேர்வு செய்யவும்",
    quizPlanetsAriaLabel: "கிரக தேர்வு",
    quizLockBtn: "பூட்டு",
    quizNextBtn: "அடுத்து",
    quizRestartBtn: "மீண்டும் தொடங்கு",
    quizCorrect: "சரி ✓✓✓",
    quizWrong: "தவறு ✗✗",
    quizAnswerLabel: "சரியான பதில்",

    // Temple list
    noResults: "பொருத்தமான முடிவுகள் இல்லை",
    listAriaLabel: "கோவில்கள் பட்டியல்",
    editBtn: "திருத்து",
    openYoutubeBtn: "Watch this video",
    youtubeLinkLabel: "Watch this video",
    viewDetailsBtn: "விவரம்",
    templeDetailsAriaLabel: "கோவில் விவரம்",
    templeDetailsTitle: "கோவில் முழு விவரம்",
    detailsCloseBtn: "மூடு",
    addTempleBtn: "கோவில் சேர்",
    reviewQueuedMessage: "பரிசீலனைக்கு அனுப்பப்பட்டது",

    // Status
    loading: "ஏற்றுகிறது...",
    errorPrefix: "பிழை",

    // Edit modal
    modalAriaLabel: "கோவில் திருத்து",
    modalTitle: "திருத்து",
    fieldTemple: "கோவில்",
    fieldLocation: "இடம்",
    fieldState: "மாநிலம்",
    fieldUrl: "YouTube URL",
    stateSelectAriaLabel: "மாநிலம் தேர்வு",
    fieldRasi: "ராசி",
    fieldRasiUnknownOption: "ராசி தெரியாது",
    fieldRasiUnknownValue: "தெரியாது",
    fieldPlanets: "கிரகங்கள்",
    saveBtn: "சேமி",
    okBtn: "சரி",
    addBtn: "சேர்க்கவும்",
    cancelBtn: "ரத்து செய்",
    modalTitleAdd: "புதிய கோவில்",
    modalAriaLabelAdd: "புதிய கோவில் சேர்",
    requiredFieldsExceptRasiError:
      "ராசி மற்றும் வீடியோ URL தவிர மற்ற எல்லா புலங்களும் கட்டாயம்.",
    noEditChangesMessage: "நீங்கள் எந்த மாற்றமும் செய்யவில்லை.",

    // Navigation
    navAriaLabel: "பக்க வழிசெலுத்தல்",
    logoutLabel: "வெளியேறு",
    viewProfileLabel: "சுயவிவரம்",
    languagePrefLabel: "மொழி விருப்பம்",
    profileNameLabel: "பெயர்",
    profileMobileLabel: "மொபைல்",
    profileRoleLabel: "பங்கு",
    languageTamilLabel: "தமிழ்",
    languageEnglishLabel: "English",

    // Login
    loginSubtitle: "மொபைல் எண் மற்றும் கடவுச்சொல்லுடன் உள்நுழையுங்கள்",
    mobileLabel: "மொபைல் எண்",
    passwordLabel: "கடவுச்சொல்",
    rememberCredentialsLabel: "பயனர் எண் மற்றும் கடவுச்சொல் நினைவில் கொள்ளவும்",
    loginBtn: "உள்நுழை",

    // Review
    reviewEmpty: "பரிசீலனைக்கு நிலுவை இல்லை",
    reviewListAriaLabel: "பரிசீலனை பட்டியல்",
    reviewActionAdd: "புதியது",
    reviewActionEdit: "திருத்தம்",
    approveBtn: "அங்கீகாரம்",
    approvedBtn: "அங்கீகரிக்கப்பட்டது",
    reviewApproversLabel: "அங்கீகார உறுப்பினர்கள்",
    reviewApprovedBy: "அங்கீகாரம்:",
    reviewWaitingForApproval: "2 அங்கீகாரங்களுக்கு காத்திருக்கிறது",
    reviewAddedBy: "சேர்க்கப்பட்டது",
    reviewModifiedBy: "திருத்தப்பட்டது",
    deleteBtn: "நீக்கு",
    deleteConfirmTitle: "நீக்குவதை உறுதிப்படுத்தவும்",
    deleteConfirmText:
      "நீங்கள் இந்த பொருளை நடிகரை முடிவாக நீக்க விரும்புகிறீர்களா?",
    deleteConfirmCancelBtn: "ரத்து",
    deleteConfirmDeleteBtn: "நீக்கு",

    // Lang toggle
    langToggleLabel: "EN",
    themeLabel: "தீம்",
    themeAriaLabel: "தீம் தேர்வு",
  },
  en: {
    // Tabs
    tabTemples: "Temples",
    tabQuiz: "Quiz",
    tabReview: "Review",
    tabUsers: "Users",

    // Admin export/import
    exportBtn: "Export",
    importBtn: "Import",
    exportTemplesBtn: "Download Temples",
    exportUsersBtn: "Download Users",

    // Filter bar
    rasiAll: "All",
    rasiAriaLabel: "Select rasi",
    searchPlaceholder: "Search...",
    searchAriaLabel: "Search temples",
    planetFilterAriaLabel: "Planet filter",

    // Users
    usersBackupTitle: "Data Backup",
    usersBackupDescription:
      "Download or import all server .json files for deployment recovery.",
    usersFileTypeError: "Only JSON files can be imported",
    usersAddTitle: "Add New User",
    usersAddSubmitBtn: "Add User",
    usersListTitle: "Users List",

    // Quiz
    quizEmpty: "No temple data available for quiz",
    quizTabAriaLabel: "Quiz",
    quizQuestionLabel: "Question",
    quizScoreLabel: "Score",
    quizTemplePrompt: "Choose the correct planet combination for this temple",
    quizPlanetsAriaLabel: "Planet selection",
    quizLockBtn: "Lock",
    quizNextBtn: "Next",
    quizRestartBtn: "Restart",
    quizCorrect: "Correct ✓✓✓",
    quizWrong: "Wrong ✗✗",
    quizAnswerLabel: "Answer",

    // Temple list
    noResults: "No results found",
    listAriaLabel: "Temples list",
    editBtn: "Edit",
    openYoutubeBtn: "Watch this video",
    youtubeLinkLabel: "Watch this video",
    viewDetailsBtn: "Details",
    templeDetailsAriaLabel: "Temple details",
    templeDetailsTitle: "Temple Details",
    detailsCloseBtn: "Close",
    addTempleBtn: "Add Temple",
    reviewQueuedMessage: "Sent to review queue",

    // Status
    loading: "Loading...",
    errorPrefix: "Error",

    // Edit modal
    modalAriaLabel: "Edit temple",
    modalTitle: "Edit",
    fieldTemple: "Temple",
    fieldLocation: "Location",
    fieldState: "State",
    fieldUrl: "YouTube URL",
    stateSelectAriaLabel: "Select state",
    fieldRasi: "Rasi",
    fieldRasiUnknownOption: "Rasi unknown",
    fieldRasiUnknownValue: "Unknown",
    fieldPlanets: "Planets",
    saveBtn: "Save",
    okBtn: "OK",
    addBtn: "Add",
    cancelBtn: "Cancel",
    modalTitleAdd: "New Temple",
    modalAriaLabelAdd: "Add new temple",
    requiredFieldsExceptRasiError:
      "All fields are mandatory except Rasi and Video URL.",
    noEditChangesMessage: "You have not modified anything.",

    // Navigation
    navAriaLabel: "Page navigation",
    logoutLabel: "Logout",
    viewProfileLabel: "View profile",
    languagePrefLabel: "Language preference",
    profileNameLabel: "Name",
    profileMobileLabel: "Mobile",
    profileRoleLabel: "Role",
    languageTamilLabel: "தமிழ்",
    languageEnglishLabel: "English",

    // Login
    loginSubtitle: "Sign in with mobile number and password",
    mobileLabel: "Mobile Number",
    passwordLabel: "Password",
    rememberCredentialsLabel: "Remember username and password",
    loginBtn: "Login",

    // Review
    reviewEmpty: "No pending reviews",
    reviewListAriaLabel: "Review list",
    reviewActionAdd: "Add",
    reviewActionEdit: "Edit",
    approveBtn: "Approve",
    approvedBtn: "Approved",
    reviewApproversLabel: "Review approvers",
    reviewApprovedBy: "Approved by",
    reviewWaitingForApproval: "Waiting for 2 approvals",
    reviewAddedBy: "Added by",
    reviewModifiedBy: "Modified by",
    deleteBtn: "Delete",
    deleteConfirmTitle: "Confirm Delete?",
    deleteConfirmText: "Are you sure you want to permanently delete this item?",
    deleteConfirmCancelBtn: "Cancel",
    deleteConfirmDeleteBtn: "Delete",

    // Lang toggle
    langToggleLabel: "த",
    themeLabel: "Theme",
    themeAriaLabel: "Select theme",
  },
};

export default STRINGS;
