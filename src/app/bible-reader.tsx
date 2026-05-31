import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { openDatabaseSync } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CreateJournalModal, {
  JournalIcon,
} from "../components/create-journal-modal";
import { Storage, STORAGE_KEYS } from "../storage";

// ─── Types ────────────────────────────────────────────────────────────────────

type Verse = {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
};

type BibleChapter = {
  reference: string;
  verses: Verse[];
};

type Journal = {
  id: string;
  name: string;
  color: string;
  emoji: string;
  iconId?: string;
};

type Testament = "OT" | "NT";

type BibleVersion = {
  id: string; // filename without .xml on Beblia repo
  name: string;
  shortName: string;
  language: string;
  languageFlag: string;
  description: string;
  isCommon?: boolean;
};

type DownloadStatus = "none" | "downloading" | "done" | "error";

// ─── Bible Versions List ──────────────────────────────────────────────────────
// Source: github.com/Beblia/Holy-Bible-XML-Format — all verified 200 OK.
// "Use at your own discretion, no need to ask for permission" — Beblia

const BIBLE_VERSIONS: BibleVersion[] = [
  // ── Featured (user's top 5) ──────────────────────────────────────────────
  {
    id: "EnglishKJBible",
    shortName: "KJV",
    name: "King James Version",
    language: "English",
    languageFlag: "🇬🇧",
    description: "Classic 1611 English translation",
    isCommon: true,
  },
  {
    id: "EnglishNIVBible",
    shortName: "NIV",
    name: "New International Version",
    language: "English",
    languageFlag: "🇺🇸",
    description: "Most popular modern English Bible",
    isCommon: true,
  },
  {
    id: "EnglishAmplifiedBible",
    shortName: "AMP",
    name: "Amplified Bible",
    language: "English",
    languageFlag: "🇺🇸",
    description: "Expanded meaning with alternate readings",
    isCommon: true,
  },
  {
    id: "EnglishESVBible",
    shortName: "ESV",
    name: "English Standard Version",
    language: "English",
    languageFlag: "🇺🇸",
    description: "Essentially literal modern translation",
    isCommon: true,
  },
  {
    id: "EnglishNKJBible",
    shortName: "NKJV",
    name: "New King James Version",
    language: "English",
    languageFlag: "🇺🇸",
    description: "Modern update to the classic KJV",
    isCommon: true,
  },
  // ── All Other Versions ───────────────────────────────────────────────────
  {
    id: "EnglishNLTBible",
    shortName: "NLT",
    name: "New Living Translation",
    language: "English",
    languageFlag: "🇺🇸",
    description: "Thought-for-thought modern translation",
  },
  {
    id: "EnglishNASBBible",
    shortName: "NASB",
    name: "New American Standard Bible",
    language: "English",
    languageFlag: "🇺🇸",
    description: "Highly literal modern translation",
  },
  {
    id: "EnglishAmplifiedClassicBible",
    shortName: "AMPC",
    name: "Amplified Bible, Classic Edition",
    language: "English",
    languageFlag: "🇺🇸",
    description: "Original Amplified version",
  },
  {
    id: "EnglishASVBible",
    shortName: "ASV",
    name: "American Standard Version",
    language: "English",
    languageFlag: "🇺🇸",
    description: "Revised 1901 American translation",
  },
  {
    id: "EnglishCSBBible",
    shortName: "CSB",
    name: "Christian Standard Bible",
    language: "English",
    languageFlag: "🇺🇸",
    description: "Balance of readability and accuracy",
  },
  {
    id: "EnglishBereanBible",
    shortName: "BSB",
    name: "Berean Standard Bible",
    language: "English",
    languageFlag: "🇺🇸",
    description: "Literal yet readable modern translation",
  },
  {
    id: "EnglishERVBible",
    shortName: "ERV",
    name: "Easy-to-Read Version",
    language: "English",
    languageFlag: "🇺🇸",
    description: "Simple English for easy understanding",
  },
  {
    id: "EnglishNETBible",
    shortName: "NET",
    name: "New English Translation",
    language: "English",
    languageFlag: "🇺🇸",
    description: "Scholarly translation with notes",
  },
  {
    id: "EnglishRSVBible",
    shortName: "RSV",
    name: "Revised Standard Version",
    language: "English",
    languageFlag: "🇺🇸",
    description: "1952 ecumenical revision",
  },
  {
    id: "EnglishMEVBible",
    shortName: "MEV",
    name: "Modern English Version",
    language: "English",
    languageFlag: "🇺🇸",
    description: "Modern update in KJV tradition",
  },
  {
    id: "EnglishYLTBible",
    shortName: "YLT",
    name: "Young's Literal Translation",
    language: "English",
    languageFlag: "🇬🇧",
    description: "Word-for-word literal (1898)",
  },
  {
    id: "EnglishDarbyBible",
    shortName: "DARBY",
    name: "Darby Bible",
    language: "English",
    languageFlag: "🇬🇧",
    description: "John Nelson Darby's translation",
  },
  // ── Filipino ─────────────────────────────────────────────────────────────
  {
    id: "TagalogBible",
    shortName: "TAG",
    name: "Ang Biblia (1905)",
    language: "Filipino",
    languageFlag: "🇵🇭",
    description: "Klasikong Tagalog na salin ng Biblia",
  },
  {
    id: "Tagalog2005Bible",
    shortName: "TAG05",
    name: "Ang Biblia (2005)",
    language: "Filipino",
    languageFlag: "🇵🇭",
    description: "2005 Tagalog Bible version",
  },
  {
    id: "Tagalog2012Bible",
    shortName: "TAG12",
    name: "Ang Biblia (2012)",
    language: "Filipino",
    languageFlag: "🇵🇭",
    description: "Makabagong Tagalog na salin",
  },
  {
    id: "CebuanoBible",
    shortName: "CEB",
    name: "Cebuano Bible",
    language: "Cebuano",
    languageFlag: "🇵🇭",
    description: "Cebuano nga hubad sa Biblia",
  },
  {
    id: "WarayBible",
    shortName: "WAR",
    name: "Waray Bible",
    language: "Waray",
    languageFlag: "🇵🇭",
    description: "Waray-Waray nga hubad",
  },
  {
    id: "PampangaBible",
    shortName: "PAM",
    name: "Pampanga Bible",
    language: "Kapampangan",
    languageFlag: "🇵🇭",
    description: "Kapampangan nga salin",
  },
  // ── Other Languages ──────────────────────────────────────────────────────
  {
    id: "SpanishBible",
    shortName: "SPA",
    name: "Spanish Bible",
    language: "Spanish",
    languageFlag: "🇪🇸",
    description: "Biblia en español",
  },
  {
    id: "SpanishRVR1960Bible",
    shortName: "RVR",
    name: "Reina Valera 1960",
    language: "Spanish",
    languageFlag: "🇪🇸",
    description: "Classic Spanish Protestant Bible",
  },
  {
    id: "FrenchBible",
    shortName: "FRA",
    name: "French Bible",
    language: "French",
    languageFlag: "🇫🇷",
    description: "La Sainte Bible",
  },
  {
    id: "GermanBible",
    shortName: "DEU",
    name: "German Bible",
    language: "German",
    languageFlag: "🇩🇪",
    description: "Deutsche Bibel",
  },
  {
    id: "ItalianBible",
    shortName: "ITA",
    name: "Italian Bible",
    language: "Italian",
    languageFlag: "🇮🇹",
    description: "La Sacra Bibbia",
  },
  {
    id: "PortugueseBible",
    shortName: "POR",
    name: "Portuguese Bible",
    language: "Portuguese",
    languageFlag: "🇵🇹",
    description: "Bíblia Sagrada",
  },
  {
    id: "RussianBible",
    shortName: "RUS",
    name: "Russian Bible",
    language: "Russian",
    languageFlag: "🇷🇺",
    description: "Русская Библия",
  },
  {
    id: "KoreanBible",
    shortName: "KOR",
    name: "Korean Bible",
    language: "Korean",
    languageFlag: "🇰🇷",
    description: "한국어 성경",
  },
  {
    id: "JapaneseBible",
    shortName: "JPN",
    name: "Japanese Bible",
    language: "Japanese",
    languageFlag: "🇯🇵",
    description: "日本語聖書",
  },
  {
    id: "ChineseBible",
    shortName: "ZHO",
    name: "Chinese Bible",
    language: "Chinese",
    languageFlag: "🇨🇳",
    description: "中文圣经",
  },
  {
    id: "ArabicBible",
    shortName: "ARA",
    name: "Arabic Bible",
    language: "Arabic",
    languageFlag: "🇸🇦",
    description: "الكتاب المقدس",
  },
  {
    id: "HindiBible",
    shortName: "HIN",
    name: "Hindi Bible",
    language: "Hindi",
    languageFlag: "🇮🇳",
    description: "हिंदी बाइबिल",
  },
  {
    id: "IndonesianBible",
    shortName: "IND",
    name: "Indonesian Bible",
    language: "Indonesian",
    languageFlag: "🇮🇩",
    description: "Alkitab Indonesia",
  },
  {
    id: "VietnameseBible",
    shortName: "VIE",
    name: "Vietnamese Bible",
    language: "Vietnamese",
    languageFlag: "🇻🇳",
    description: "Kinh Thánh tiếng Việt",
  },
  {
    id: "HebrewBible",
    shortName: "HEB",
    name: "Hebrew Bible",
    language: "Hebrew",
    languageFlag: "🇮🇱",
    description: "התנ״ך",
  },
  {
    id: "GreekBible",
    shortName: "GRK",
    name: "Greek Bible",
    language: "Greek",
    languageFlag: "🇬🇷",
    description: "Αγία Γραφή",
  },
  {
    id: "LatinBible",
    shortName: "LAT",
    name: "Latin Bible",
    language: "Latin",
    languageFlag: "🇻🇦",
    description: "Biblia Sacra",
  },
  {
    id: "SwahiliBible",
    shortName: "SWA",
    name: "Swahili Bible",
    language: "Swahili",
    languageFlag: "🇰🇪",
    description: "Biblia Takatifu",
  },
  {
    id: "AfrikaansBible",
    shortName: "AFR",
    name: "Afrikaans Bible",
    language: "Afrikaans",
    languageFlag: "🇿🇦",
    description: "Afrikaanse Bybel",
  },
  {
    id: "DutchBible",
    shortName: "NLD",
    name: "Dutch Bible",
    language: "Dutch",
    languageFlag: "🇳🇱",
    description: "Nederlandse Bijbel",
  },
  {
    id: "PolishBible",
    shortName: "POL",
    name: "Polish Bible",
    language: "Polish",
    languageFlag: "🇵🇱",
    description: "Biblia Polska",
  },
  {
    id: "RomanianBible",
    shortName: "RON",
    name: "Romanian Bible",
    language: "Romanian",
    languageFlag: "🇷🇴",
    description: "Biblia Românească",
  },
  {
    id: "TurkishBible",
    shortName: "TUR",
    name: "Turkish Bible",
    language: "Turkish",
    languageFlag: "🇹🇷",
    description: "Türkçe Kutsal Kitap",
  },
  {
    id: "UkrainianBible",
    shortName: "UKR",
    name: "Ukrainian Bible",
    language: "Ukrainian",
    languageFlag: "🇺🇦",
    description: "Українська Біблія",
  },
  {
    id: "ThaiKJVBible",
    shortName: "THA",
    name: "Thai Bible",
    language: "Thai",
    languageFlag: "🇹🇭",
    description: "พระคัมภีร์ไทย",
  },
  {
    id: "NorwegianBible",
    shortName: "NOR",
    name: "Norwegian Bible",
    language: "Norwegian",
    languageFlag: "🇳🇴",
    description: "Norsk Bibel",
  },
  {
    id: "SwedishBible",
    shortName: "SWE",
    name: "Swedish Bible",
    language: "Swedish",
    languageFlag: "🇸🇪",
    description: "Svensk Bibel",
  },
  {
    id: "DanishBible",
    shortName: "DAN",
    name: "Danish Bible",
    language: "Danish",
    languageFlag: "🇩🇰",
    description: "Dansk Bibel",
  },
  {
    id: "FinnishBible",
    shortName: "FIN",
    name: "Finnish Bible",
    language: "Finnish",
    languageFlag: "🇫🇮",
    description: "Suomalainen Raamattu",
  },
  {
    id: "HungarianBible",
    shortName: "HUN",
    name: "Hungarian Bible",
    language: "Hungarian",
    languageFlag: "🇭🇺",
    description: "Magyar Biblia",
  },
  {
    id: "CzechBible",
    shortName: "CES",
    name: "Czech Bible",
    language: "Czech",
    languageFlag: "🇨🇿",
    description: "Česká Bible",
  },
  {
    id: "BulgarianBible",
    shortName: "BUL",
    name: "Bulgarian Bible",
    language: "Bulgarian",
    languageFlag: "🇧🇬",
    description: "Българска Библия",
  },
  {
    id: "CroatianBible",
    shortName: "HRV",
    name: "Croatian Bible",
    language: "Croatian",
    languageFlag: "🇭🇷",
    description: "Hrvatska Biblija",
  },
  {
    id: "SerbianBible",
    shortName: "SRP",
    name: "Serbian Bible",
    language: "Serbian",
    languageFlag: "🇷🇸",
    description: "Српска Библија",
  },
  {
    id: "PersianBible",
    shortName: "FAS",
    name: "Persian Bible",
    language: "Persian",
    languageFlag: "🇮🇷",
    description: "کتاب مقدس فارسی",
  },
  {
    id: "BengaliBible",
    shortName: "BEN",
    name: "Bengali Bible",
    language: "Bengali",
    languageFlag: "🇧🇩",
    description: "বাংলা বাইবেল",
  },
  {
    id: "TamilBible",
    shortName: "TAM",
    name: "Tamil Bible",
    language: "Tamil",
    languageFlag: "🇮🇳",
    description: "தமிழ் வேதாகமம்",
  },
  {
    id: "TeluguBible",
    shortName: "TEL",
    name: "Telugu Bible",
    language: "Telugu",
    languageFlag: "🇮🇳",
    description: "తెలుగు బైబిల్",
  },
  {
    id: "UrduBible",
    shortName: "URD",
    name: "Urdu Bible",
    language: "Urdu",
    languageFlag: "🇵🇰",
    description: "اردو بائبل",
  },
  {
    id: "BurmeseBible",
    shortName: "MYA",
    name: "Burmese Bible",
    language: "Burmese",
    languageFlag: "🇲🇲",
    description: "မြန်မာ သမ္မာကျမ်း",
  },
  {
    id: "KhmerBible",
    shortName: "KHM",
    name: "Khmer Bible",
    language: "Khmer",
    languageFlag: "🇰🇭",
    description: "ព្រះគម្ពីរខ្មែរ",
  },
  {
    id: "AmharicBible",
    shortName: "AMH",
    name: "Amharic Bible",
    language: "Amharic",
    languageFlag: "🇪🇹",
    description: "የአማርኛ መጽሐፍ ቅዱስ",
  },
  {
    id: "MalayalamBible",
    shortName: "MAL",
    name: "Malayalam Bible",
    language: "Malayalam",
    languageFlag: "🇮🇳",
    description: "മലയാളം ബൈബിൾ",
  },
  {
    id: "KannadaBible",
    shortName: "KAN",
    name: "Kannada Bible",
    language: "Kannada",
    languageFlag: "🇮🇳",
    description: "ಕನ್ನಡ ಬೈಬಲ್",
  },
  {
    id: "GujaratiBible",
    shortName: "GUJ",
    name: "Gujarati Bible",
    language: "Gujarati",
    languageFlag: "🇮🇳",
    description: "ગુજરાતી બાઇબલ",
  },
  {
    id: "MarathiBible",
    shortName: "MAR",
    name: "Marathi Bible",
    language: "Marathi",
    languageFlag: "🇮🇳",
    description: "मराठी बायबल",
  },
  {
    id: "IcelandicBible",
    shortName: "ISL",
    name: "Icelandic Bible",
    language: "Icelandic",
    languageFlag: "🇮🇸",
    description: "Íslensk Biblía",
  },
  {
    id: "AlbanianBible",
    shortName: "SQI",
    name: "Albanian Bible",
    language: "Albanian",
    languageFlag: "🇦🇱",
    description: "Bibla Shqiptare",
  },
  {
    id: "ArmenianBible",
    shortName: "HYE",
    name: "Armenian Bible",
    language: "Armenian",
    languageFlag: "🇦🇲",
    description: "Հայերեն Աստուածաdelays",
  },
  {
    id: "GeorgianBible",
    shortName: "KAT",
    name: "Georgian Bible",
    language: "Georgian",
    languageFlag: "🇬🇪",
    description: "ქართული ბიბლია",
  },
  {
    id: "SlovenianBible",
    shortName: "SLV",
    name: "Slovenian Bible",
    language: "Slovenian",
    languageFlag: "🇸🇮",
    description: "Slovenska Biblija",
  },
  {
    id: "LithuanianBible",
    shortName: "LIT",
    name: "Lithuanian Bible",
    language: "Lithuanian",
    languageFlag: "🇱🇹",
    description: "Lietuviška Biblija",
  },
  {
    id: "LatvianBible",
    shortName: "LAV",
    name: "Latvian Bible",
    language: "Latvian",
    languageFlag: "🇱🇻",
    description: "Latvijas Bībele",
  },
  {
    id: "EstonianBible",
    shortName: "EST",
    name: "Estonian Bible",
    language: "Estonian",
    languageFlag: "🇪🇪",
    description: "Eesti Piibel",
  },
];

const STORAGE_KEY_ACTIVE_VERSION = "bible_active_version";

// Single source — Beblia GitHub repo
const BEBLIA_URL =
  "https://raw.githubusercontent.com/Beblia/Holy-Bible-XML-Format/master/";

// ─── Bible Books List ─────────────────────────────────────────────────────────

const BIBLE_BOOKS: { name: string; chapters: number; testament: Testament }[] =
  [
    // Old Testament
    { name: "Genesis", chapters: 50, testament: "OT" },
    { name: "Exodus", chapters: 40, testament: "OT" },
    { name: "Leviticus", chapters: 27, testament: "OT" },
    { name: "Numbers", chapters: 36, testament: "OT" },
    { name: "Deuteronomy", chapters: 34, testament: "OT" },
    { name: "Joshua", chapters: 24, testament: "OT" },
    { name: "Judges", chapters: 21, testament: "OT" },
    { name: "Ruth", chapters: 4, testament: "OT" },
    { name: "1 Samuel", chapters: 31, testament: "OT" },
    { name: "2 Samuel", chapters: 24, testament: "OT" },
    { name: "1 Kings", chapters: 22, testament: "OT" },
    { name: "2 Kings", chapters: 25, testament: "OT" },
    { name: "1 Chronicles", chapters: 29, testament: "OT" },
    { name: "2 Chronicles", chapters: 36, testament: "OT" },
    { name: "Ezra", chapters: 10, testament: "OT" },
    { name: "Nehemiah", chapters: 13, testament: "OT" },
    { name: "Esther", chapters: 10, testament: "OT" },
    { name: "Job", chapters: 42, testament: "OT" },
    { name: "Psalms", chapters: 150, testament: "OT" },
    { name: "Proverbs", chapters: 31, testament: "OT" },
    { name: "Ecclesiastes", chapters: 12, testament: "OT" },
    { name: "Song of Solomon", chapters: 8, testament: "OT" },
    { name: "Isaiah", chapters: 66, testament: "OT" },
    { name: "Jeremiah", chapters: 52, testament: "OT" },
    { name: "Lamentations", chapters: 5, testament: "OT" },
    { name: "Ezekiel", chapters: 48, testament: "OT" },
    { name: "Daniel", chapters: 12, testament: "OT" },
    { name: "Hosea", chapters: 14, testament: "OT" },
    { name: "Joel", chapters: 3, testament: "OT" },
    { name: "Amos", chapters: 9, testament: "OT" },
    { name: "Obadiah", chapters: 1, testament: "OT" },
    { name: "Jonah", chapters: 4, testament: "OT" },
    { name: "Micah", chapters: 7, testament: "OT" },
    { name: "Nahum", chapters: 3, testament: "OT" },
    { name: "Habakkuk", chapters: 3, testament: "OT" },
    { name: "Zephaniah", chapters: 3, testament: "OT" },
    { name: "Haggai", chapters: 2, testament: "OT" },
    { name: "Zechariah", chapters: 14, testament: "OT" },
    { name: "Malachi", chapters: 4, testament: "OT" },
    // New Testament
    { name: "Matthew", chapters: 28, testament: "NT" },
    { name: "Mark", chapters: 16, testament: "NT" },
    { name: "Luke", chapters: 24, testament: "NT" },
    { name: "John", chapters: 21, testament: "NT" },
    { name: "Acts", chapters: 28, testament: "NT" },
    { name: "Romans", chapters: 16, testament: "NT" },
    { name: "1 Corinthians", chapters: 16, testament: "NT" },
    { name: "2 Corinthians", chapters: 13, testament: "NT" },
    { name: "Galatians", chapters: 6, testament: "NT" },
    { name: "Ephesians", chapters: 6, testament: "NT" },
    { name: "Philippians", chapters: 4, testament: "NT" },
    { name: "Colossians", chapters: 4, testament: "NT" },
    { name: "1 Thessalonians", chapters: 5, testament: "NT" },
    { name: "2 Thessalonians", chapters: 3, testament: "NT" },
    { name: "1 Timothy", chapters: 6, testament: "NT" },
    { name: "2 Timothy", chapters: 4, testament: "NT" },
    { name: "Titus", chapters: 3, testament: "NT" },
    { name: "Philemon", chapters: 1, testament: "NT" },
    { name: "Hebrews", chapters: 13, testament: "NT" },
    { name: "James", chapters: 5, testament: "NT" },
    { name: "1 Peter", chapters: 5, testament: "NT" },
    { name: "2 Peter", chapters: 3, testament: "NT" },
    { name: "1 John", chapters: 5, testament: "NT" },
    { name: "2 John", chapters: 1, testament: "NT" },
    { name: "3 John", chapters: 1, testament: "NT" },
    { name: "Jude", chapters: 1, testament: "NT" },
    { name: "Revelation", chapters: 22, testament: "NT" },
  ];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function asString(val: string | string[] | undefined, fallback = ""): string {
  if (!val) return fallback;
  return Array.isArray(val) ? val[0] : val;
}

// ─── Local Bible Storage (expo-sqlite) ────────────────────────────────────────
// SQLite has NO size limit (unlike AsyncStorage's 6MB).
// Stores all chapters in a single database file: bibles.db
// Lazy-init — Android's native module may not be ready at module-load time.

let _bibleDb: ReturnType<typeof openDatabaseSync> | null = null;

function getBibleDb() {
  if (!_bibleDb) {
    _bibleDb = openDatabaseSync("bibles.db");
    _bibleDb.execSync(`
      CREATE TABLE IF NOT EXISTS chapters (
        vid TEXT NOT NULL,
        bi  INTEGER NOT NULL,
        ch  INTEGER NOT NULL,
        verses TEXT NOT NULL,
        PRIMARY KEY (vid, bi, ch)
      );
      CREATE TABLE IF NOT EXISTS downloaded (
        vid TEXT PRIMARY KEY
      );
    `);
  }
  return _bibleDb;
}

function isBibleDownloaded(versionId: string): boolean {
  const row = getBibleDb().getFirstSync<{ vid: string }>(
    "SELECT vid FROM downloaded WHERE vid = ?",
    [versionId],
  );
  return row !== null;
}

function getDownloadedVersionIds(): string[] {
  const rows = getBibleDb().getAllSync<{ vid: string }>(
    "SELECT vid FROM downloaded",
  );
  return rows.map((r) => r.vid);
}

// Yields the JS thread so React can flush state updates (progress bar re-renders)
function yieldThread(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function downloadBible(
  versionId: string,
  onProgress?: (pct: number) => void,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const version = BIBLE_VERSIONS.find((v) => v.id === versionId);
    if (!version) return { ok: false, error: `Unknown version: ${versionId}` };

    const url = `${BEBLIA_URL}${version.id}.xml`;
    console.log("[Bible DL] Fetching:", url);
    const res = await fetch(url);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const xml = await res.text();
    console.log("[Bible DL] Downloaded chars:", xml.length);
    if (onProgress) onProgress(25);
    await yieldThread();

    // ── Parse Beblia XML with indexOf only (no regex) ─────────────────────
    // Format: <book number="N"><chapter number="N"><verse number="N">text</verse>
    const VERSE_OPEN = '<verse number="';
    const VERSE_CLOSE = "</verse>";
    const BOOK_OPEN = '<book number="';
    const CHAPTER_OPEN = '<chapter number="';

    // bookNum is 1-indexed (1-66), our storage uses 0-indexed bookIdx
    let currentBook = 0;
    let currentChapter = 0;
    const bookMap: Map<number, Map<number, string[]>> = new Map();

    let pos = 0;
    let count = 0;

    while (pos < xml.length) {
      // Find the next interesting tag
      const nextBook = xml.indexOf(BOOK_OPEN, pos);
      const nextChapter = xml.indexOf(CHAPTER_OPEN, pos);
      const nextVerse = xml.indexOf(VERSE_OPEN, pos);

      // No more verses — done
      if (nextVerse === -1) break;

      // Update book if a <book> tag comes before this verse
      if (nextBook !== -1 && nextBook < nextVerse) {
        const numStart = nextBook + BOOK_OPEN.length;
        const numEnd = xml.indexOf('"', numStart);
        if (numEnd !== -1)
          currentBook = parseInt(xml.substring(numStart, numEnd), 10);
      }

      // Update chapter if a <chapter> tag comes before this verse
      if (nextChapter !== -1 && nextChapter < nextVerse) {
        const numStart = nextChapter + CHAPTER_OPEN.length;
        const numEnd = xml.indexOf('"', numStart);
        if (numEnd !== -1)
          currentChapter = parseInt(xml.substring(numStart, numEnd), 10);
      }

      // Extract verse text
      const textStart = xml.indexOf(">", nextVerse + VERSE_OPEN.length);
      const textEnd = xml.indexOf(VERSE_CLOSE, textStart + 1);
      if (textStart === -1 || textEnd === -1) {
        pos = nextVerse + 1;
        continue;
      }

      const text = xml.substring(textStart + 1, textEnd).trim();
      if (text.length > 0 && currentBook > 0 && currentChapter > 0) {
        const bookIdx = currentBook - 1; // 0-indexed
        if (!bookMap.has(bookIdx)) bookMap.set(bookIdx, new Map());
        const chapters = bookMap.get(bookIdx)!;
        if (!chapters.has(currentChapter)) chapters.set(currentChapter, []);
        chapters.get(currentChapter)!.push(text);
      }

      pos = textEnd + VERSE_CLOSE.length;
      count++;

      if (count % 500 === 0) {
        if (onProgress) onProgress(25 + Math.round((count / 31100) * 40)); // 25-65%
        await yieldThread();
      }
    }

    console.log("[Bible DL] Parsed", count, "verses,", bookMap.size, "books");
    if (onProgress) onProgress(65);
    await yieldThread();

    // Convert to RawBook[]
    const books: RawBook[] = [];
    for (let bi = 0; bi < 66; bi++) {
      const chapterMap = bookMap.get(bi) ?? new Map();
      const chapters: string[][] = [];
      for (let c = 1; c <= chapterMap.size; c++)
        chapters.push(chapterMap.get(c) ?? []);
      books.push({ name: "", abbrev: "", chapters });
    }

    return storeBooks(version.id, books, (pct) => {
      if (onProgress) onProgress(65 + Math.round(pct * 0.35));
    });
  } catch (e: any) {
    console.error("[Bible DL] Error:", e?.message ?? e);
    return { ok: false, error: e?.message ?? String(e) };
  }
}

// Raw book type for internal processing
type RawBook = { name: string; abbrev: string; chapters: string[][] };

// ── Shared: write all chapters to SQLite in one transaction ───────────────────
async function storeBooks(
  versionId: string,
  books: RawBook[],
  onProgress?: (pct: number) => void,
): Promise<{ ok: boolean; error?: string }> {
  // Collect all chapter data
  const rows: { bi: number; ch: number; data: string }[] = [];
  books.forEach((book, bookIdx) => {
    book.chapters.forEach((verses, chIdx) => {
      if (verses.length > 0) {
        rows.push({ bi: bookIdx, ch: chIdx + 1, data: JSON.stringify(verses) });
      }
    });
  });

  // Insert in batched transactions — yield between batches for UI
  const BATCH = 200;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    getBibleDb().withTransactionSync(() => {
      for (const row of batch) {
        getBibleDb().runSync(
          "INSERT OR REPLACE INTO chapters (vid, bi, ch, verses) VALUES (?, ?, ?, ?)",
          [versionId, row.bi, row.ch, row.data],
        );
      }
    });
    const pct = Math.min(99, Math.round(((i + BATCH) / rows.length) * 100));
    if (onProgress) onProgress(pct);
    await yieldThread();
  }

  // Mark as downloaded
  getBibleDb().runSync("INSERT OR REPLACE INTO downloaded (vid) VALUES (?)", [
    versionId,
  ]);

  if (onProgress) onProgress(100);
  console.log("[Bible DL] Stored", rows.length, "chapters for", versionId);
  return { ok: true };
}

async function deleteLocalBible(versionId: string): Promise<void> {
  try {
    getBibleDb().withTransactionSync(() => {
      getBibleDb().runSync("DELETE FROM chapters WHERE vid = ?", [versionId]);
      getBibleDb().runSync("DELETE FROM downloaded WHERE vid = ?", [versionId]);
    });
  } catch {}
}

async function fetchChapterLocal(
  versionId: string,
  book: string,
  chapter: number,
): Promise<BibleChapter | null> {
  try {
    const bookIdx = BIBLE_BOOKS.findIndex(
      (b) => b.name.toLowerCase() === book.toLowerCase(),
    );
    if (bookIdx === -1) return null;

    const row = getBibleDb().getFirstSync<{ verses: string }>(
      "SELECT verses FROM chapters WHERE vid = ? AND bi = ? AND ch = ?",
      [versionId, bookIdx, chapter],
    );
    if (!row) return null;

    const verses: string[] = JSON.parse(row.verses);
    return {
      reference: `${book} ${chapter}`,
      verses: verses.map((text, idx) => ({
        book_id: String(bookIdx + 1),
        book_name: book,
        chapter,
        verse: idx + 1,
        text,
      })),
    };
  } catch {
    return null;
  }
}

async function fetchChapter(
  book: string,
  chapter: number,
  versionId = "EnglishKJBible",
): Promise<{ data: BibleChapter | null; error?: string }> {
  const downloaded = await isBibleDownloaded(versionId);
  if (downloaded) {
    try {
      const data = await fetchChapterLocal(versionId, book, chapter);
      if (!data)
        return { data: null, error: `Chapter not found: ${book} ${chapter}` };
      return { data };
    } catch (e: any) {
      return {
        data: null,
        error: `Failed to read local data: ${e?.message ?? e}`,
      };
    }
  }
  const name =
    BIBLE_VERSIONS.find((v) => v.id === versionId)?.shortName ?? versionId;
  return {
    data: null,
    error: `"${name}" is not downloaded yet. Tap the version button (top right) to download it.`,
  };
}

// ─── Version Picker Modal ─────────────────────────────────────────────────────

type VersionPickerProps = {
  visible: boolean;
  activeVersionId: string;
  onSelect: (versionId: string) => void;
  onClose: () => void;
};

function VersionPickerModal({
  visible,
  activeVersionId,
  onSelect,
  onClose,
}: VersionPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatuses, setDownloadStatuses] = useState<
    Record<string, DownloadStatus>
  >({});
  const [lastError, setLastError] = useState<string | null>(null);
  const [showBrowse, setShowBrowse] = useState(false);
  const searchRef = useRef<TextInput>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (visible) mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, [visible]);

  const handleClose = () => {
    mountedRef.current = false;
    setShowBrowse(false);
    onClose();
  };

  // Load downloaded versions
  useEffect(() => {
    if (!visible) return;
    setSearchQuery("");
    setLastError(null);
    setShowBrowse(false);
    const ids = getDownloadedVersionIds();
    setDownloadedIds(ids);
    // Auto-show browse if nothing downloaded
    if (ids.length === 0) setShowBrowse(true);
  }, [visible]);

  const isSearching = searchQuery.trim().length > 0;
  const query = searchQuery.toLowerCase();

  const myVersions = BIBLE_VERSIONS.filter((v) => downloadedIds.includes(v.id));

  const browseFiltered = isSearching
    ? BIBLE_VERSIONS.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.shortName.toLowerCase().includes(query) ||
          v.language.toLowerCase().includes(query),
      )
    : BIBLE_VERSIONS;

  const handleDownload = async (version: BibleVersion) => {
    if (downloadingId) return;
    setDownloadingId(version.id);
    setDownloadProgress(0);
    setLastError(null);
    setDownloadStatuses((prev) => ({ ...prev, [version.id]: "downloading" }));

    const result = await downloadBible(version.id, (pct) => {
      if (mountedRef.current) setDownloadProgress(pct);
    });

    if (!mountedRef.current) return;

    if (result.ok) {
      setDownloadedIds((prev) => [...prev, version.id]);
      setDownloadStatuses((prev) => ({ ...prev, [version.id]: "done" }));
      onSelect(version.id);
    } else {
      setLastError(result.error ?? "Unknown error");
      setDownloadStatuses((prev) => ({ ...prev, [version.id]: "error" }));
    }
    setDownloadingId(null);
  };

  const handleDelete = async (version: BibleVersion) => {
    await deleteLocalBible(version.id);
    const updated = downloadedIds.filter((id) => id !== version.id);
    setDownloadedIds(updated);
    if (activeVersionId === version.id) {
      onSelect(updated[0] ?? "EnglishKJBible");
    }
  };

  // ── Render a version row ──────────────────────────────────────────────────
  const renderRow = (version: BibleVersion, mode: "my" | "browse") => {
    const isDownloaded = downloadedIds.includes(version.id);
    const isActive = version.id === activeVersionId && isDownloaded;
    const isDownloading = downloadingId === version.id;
    const status = downloadStatuses[version.id];

    return (
      <Pressable
        key={version.id}
        onPress={() => {
          if (isDownloaded) {
            onSelect(version.id);
            handleClose();
          } else handleDownload(version);
        }}
        style={({ pressed }) => [
          vs.row,
          isActive && vs.rowActive,
          pressed && !isActive && vs.rowPressed,
        ]}
      >
        <View style={[vs.badge, isActive && vs.badgeActive]}>
          <Text
            style={[vs.badgeText, isActive && vs.badgeTextActive]}
            numberOfLines={1}
          >
            {version.shortName}
          </Text>
        </View>

        <View style={vs.rowInfo}>
          <Text
            style={[vs.rowName, isActive && vs.rowNameActive]}
            numberOfLines={1}
          >
            {version.name}
          </Text>
          <Text style={vs.rowLang} numberOfLines={1}>
            {version.languageFlag} {version.language}
          </Text>
        </View>

        {isDownloading ? (
          <View style={vs.progressWrap}>
            <ActivityIndicator size="small" color="#c084fc" />
            <Text style={vs.progressLabel}>{downloadProgress}%</Text>
          </View>
        ) : mode === "my" && isDownloaded ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(version);
            }}
            hitSlop={10}
            style={vs.iconBtn}
          >
            <FontAwesome6 name="trash-can" size={14} color="#444" />
          </Pressable>
        ) : isDownloaded ? (
          <FontAwesome6 name="check" size={14} color="#4ade80" />
        ) : status === "error" ? (
          <Text style={vs.retryLabel}>Retry</Text>
        ) : (
          <FontAwesome6 name="cloud-arrow-down" size={16} color="#555" />
        )}
      </Pressable>
    );
  };

  // ── Modal JSX ─────────────────────────────────────────────────────────────
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={vs.overlay} onPress={handleClose}>
        <Pressable style={vs.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Drag handle */}
          <Pressable onPress={handleClose} style={vs.handleWrap}>
            <View style={vs.handle} />
          </Pressable>

          {/* Header */}
          <View style={vs.header}>
            {showBrowse ? (
              <Pressable
                onPress={() => setShowBrowse(false)}
                hitSlop={16}
                style={vs.backBtn}
              >
                <FontAwesome6 name="chevron-left" size={16} color="#aaa" />
              </Pressable>
            ) : (
              <View style={{ width: 40 }} />
            )}
            <Text style={vs.headerTitle}>
              {showBrowse
                ? `${BIBLE_VERSIONS.length} Versions`
                : "Bible Version"}
            </Text>
            <Pressable onPress={handleClose} hitSlop={16} style={vs.backBtn}>
              <FontAwesome6 name="xmark" size={16} color="#aaa" />
            </Pressable>
          </View>

          {/* Error banner */}
          {lastError && (
            <View style={vs.errorBanner}>
              <FontAwesome6
                name="triangle-exclamation"
                size={12}
                color="#f87171"
              />
              <Text style={vs.errorBannerText} numberOfLines={2}>
                {lastError}
              </Text>
              <Pressable onPress={() => setLastError(null)} hitSlop={8}>
                <FontAwesome6 name="xmark" size={12} color="#f87171" />
              </Pressable>
            </View>
          )}

          {showBrowse ? (
            /* ════════ BROWSE VIEW ════════ */
            <>
              {/* Search */}
              <View style={vs.searchWrap}>
                <FontAwesome6
                  name="magnifying-glass"
                  size={13}
                  color="#555"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  ref={searchRef}
                  style={vs.searchInput}
                  placeholder="Search by name or language..."
                  placeholderTextColor="#444"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                    <FontAwesome6 name="circle-xmark" size={15} color="#444" />
                  </Pressable>
                )}
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 50 }}
              >
                {/* Featured section (only when not searching) */}
                {!isSearching && (
                  <>
                    <View style={vs.sectionRow}>
                      <FontAwesome6
                        name="star"
                        size={10}
                        color="#f5c842"
                        solid
                      />
                      <Text style={vs.sectionTitle}>Featured</Text>
                    </View>
                    {BIBLE_VERSIONS.filter((v) => v.isCommon).map((v) =>
                      renderRow(v, "browse"),
                    )}
                    <View style={vs.divider} />
                  </>
                )}

                <View style={vs.sectionRow}>
                  <Text style={vs.sectionTitle}>
                    {isSearching ? "Results" : "All Versions"}
                  </Text>
                  <View style={vs.countBadge}>
                    <Text style={vs.countBadgeText}>
                      {browseFiltered.length}
                    </Text>
                  </View>
                </View>

                {browseFiltered.length === 0 ? (
                  <View style={vs.emptyState}>
                    <Text style={vs.emptyText}>
                      No versions found for "{searchQuery}"
                    </Text>
                  </View>
                ) : (
                  browseFiltered.map((v) => renderRow(v, "browse"))
                )}
              </ScrollView>
            </>
          ) : (
            /* ════════ MY VERSIONS VIEW ════════ */
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 50 }}
            >
              {myVersions.length > 0 ? (
                <>
                  <View style={vs.sectionRow}>
                    <Text style={vs.sectionTitle}>My Versions</Text>
                    <View style={vs.countBadge}>
                      <Text style={vs.countBadgeText}>{myVersions.length}</Text>
                    </View>
                  </View>
                  {myVersions.map((v) => renderRow(v, "my"))}
                </>
              ) : (
                <View style={vs.emptyState}>
                  <FontAwesome6
                    name="book-bible"
                    size={32}
                    color="#333"
                    style={{ marginBottom: 10 }}
                  />
                  <Text style={vs.emptyText}>No versions downloaded yet</Text>
                </View>
              )}

              {/* More Versions button */}
              <View style={{ alignItems: "center", marginTop: 24 }}>
                <Pressable
                  onPress={() => setShowBrowse(true)}
                  style={({ pressed }) => [
                    vs.moreBtn,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={vs.moreBtnText}>More Versions</Text>
                </Pressable>
                <Text style={vs.moreBtnSub}>
                  {BIBLE_VERSIONS.length} versions available
                </Text>
              </View>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const vs = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0f0f0f",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  handleWrap: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 2,
  },
  handle: { width: 36, height: 4, backgroundColor: "#333", borderRadius: 2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 8 },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#252525",
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 11 },
  errorBanner: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: "#1f0808",
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  errorBannerText: { color: "#f87171", fontSize: 12, flex: 1 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  sectionTitle: { color: "#888", fontSize: 13, fontWeight: "700" },
  countBadge: {
    backgroundColor: "#252525",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: { color: "#666", fontSize: 11, fontWeight: "700" },
  divider: {
    height: 1,
    backgroundColor: "#1a1a1a",
    marginHorizontal: 20,
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginHorizontal: 6,
    borderRadius: 12,
  },
  rowActive: { backgroundColor: "#140820" },
  rowPressed: { backgroundColor: "#151515" },
  badge: {
    width: 52,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#252525",
  },
  badgeActive: { backgroundColor: "#1e0a3c", borderColor: "#3d1f6e" },
  badgeText: {
    color: "#888",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  badgeTextActive: { color: "#c084fc" },
  rowInfo: { flex: 1, gap: 2 },
  rowName: { color: "#ccc", fontSize: 14, fontWeight: "600" },
  rowNameActive: { color: "#e0c0ff" },
  rowLang: { color: "#444", fontSize: 12 },
  progressWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  progressLabel: {
    color: "#c084fc",
    fontSize: 12,
    fontWeight: "700",
    minWidth: 30,
  },
  iconBtn: { padding: 8 },
  retryLabel: { color: "#f87171", fontSize: 12, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#444", fontSize: 14 },
  moreBtn: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#252525",
  },
  moreBtnText: { color: "#ccc", fontSize: 14, fontWeight: "600" },
  moreBtnSub: { color: "#333", fontSize: 12, marginTop: 8 },
});

// ─── Book Picker Modal ────────────────────────────────────────────────────────

type BookPickerProps = {
  visible: boolean;
  selectedBook: string;
  onSelect: (book: string) => void;
  onClose: () => void;
};

function BookPickerModal({
  visible,
  selectedBook,
  onSelect,
  onClose,
}: BookPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Testament>(
    () => BIBLE_BOOKS.find((b) => b.name === selectedBook)?.testament ?? "NT",
  );
  const flatListRef = useRef<FlatList>(null);
  const searchRef = useRef<TextInput>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSearchQuery("");
      const tab =
        BIBLE_BOOKS.find((b) => b.name === selectedBook)?.testament ?? "NT";
      setActiveTab(tab);
    }
  }, [visible, selectedBook]);

  const isSearching = searchQuery.trim().length > 0;

  // Filter logic: search overrides tab
  const filteredBooks = isSearching
    ? BIBLE_BOOKS.filter((b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : BIBLE_BOOKS.filter((b) => b.testament === activeTab);

  // Scroll to selected book when tab changes (not searching)
  useEffect(() => {
    if (isSearching || !visible) return;
    const idx = filteredBooks.findIndex((b) => b.name === selectedBook);
    if (idx >= 0) {
      // Small delay to let FlatList settle
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: idx,
          animated: true,
          viewPosition: 0.3,
        });
      }, 100);
    }
  }, [activeTab, visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={pickerStyles.overlay} onPress={onClose}>
        <Pressable
          style={pickerStyles.sheet}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <View style={pickerStyles.handle} />

          {/* Header */}
          <View style={pickerStyles.header}>
            <Text style={pickerStyles.title}>Select Book</Text>
            <Pressable onPress={onClose} style={pickerStyles.closeBtn}>
              <FontAwesome6 name="xmark" size={14} color="#555" />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={pickerStyles.searchWrapper}>
            <FontAwesome6
              name="magnifying-glass"
              size={13}
              color="#555"
              style={pickerStyles.searchIcon}
            />
            <TextInput
              ref={searchRef}
              style={pickerStyles.searchInput}
              placeholder="Search book..."
              placeholderTextColor="#444"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="words"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                style={pickerStyles.searchClear}
              >
                <FontAwesome6 name="circle-xmark" size={14} color="#444" />
              </Pressable>
            )}
          </View>

          {/* Testament Tabs — hidden when searching */}
          {!isSearching && (
            <View style={pickerStyles.tabs}>
              {(["OT", "NT"] as Testament[]).map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    pickerStyles.tab,
                    activeTab === tab && pickerStyles.tabActive,
                  ]}
                >
                  <Text
                    style={[
                      pickerStyles.tabText,
                      activeTab === tab && pickerStyles.tabTextActive,
                    ]}
                  >
                    {tab === "OT" ? "Old Testament" : "New Testament"}
                  </Text>
                  <Text
                    style={[
                      pickerStyles.tabCount,
                      activeTab === tab && pickerStyles.tabCountActive,
                    ]}
                  >
                    {BIBLE_BOOKS.filter((b) => b.testament === tab).length}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Search result label */}
          {isSearching && (
            <Text style={pickerStyles.searchResultLabel}>
              {filteredBooks.length === 0
                ? "No results"
                : `${filteredBooks.length} result${filteredBooks.length !== 1 ? "s" : ""}`}
            </Text>
          )}

          {/* Book List */}
          <FlatList
            ref={flatListRef}
            data={filteredBooks}
            keyExtractor={(b) => b.name}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScrollToIndexFailed={() => {}}
            contentContainerStyle={{ paddingBottom: 32 }}
            renderItem={({ item }) => {
              const isSelected = item.name === selectedBook;
              return (
                <Pressable
                  onPress={() => onSelect(item.name)}
                  style={({ pressed }) => [
                    pickerStyles.item,
                    isSelected && pickerStyles.itemSelected,
                    pressed && !isSelected && pickerStyles.itemPressed,
                  ]}
                >
                  <View style={pickerStyles.itemContent}>
                    <Text
                      style={[
                        pickerStyles.itemText,
                        isSelected && pickerStyles.itemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        pickerStyles.itemChapters,
                        isSelected && pickerStyles.itemChaptersSelected,
                      ]}
                    >
                      {item.chapters} ch
                    </Text>
                  </View>
                  {isSelected && (
                    <FontAwesome6 name="check" size={12} color="#c084fc" />
                  )}
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#111",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "82%",
    borderTopWidth: 1,
    borderColor: "#222",
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "#2a2a2a",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: { color: "#fff", fontSize: 17, fontWeight: "700" },
  closeBtn: { padding: 4 },

  // Search
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    paddingVertical: 11,
    fontWeight: "400",
  },
  searchClear: { padding: 4 },
  searchResultLabel: {
    color: "#444",
    fontSize: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  // Tabs
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: { backgroundColor: "#1e0a3c" },
  tabText: { color: "#555", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#c084fc" },
  tabCount: {
    color: "#333",
    fontSize: 11,
    fontWeight: "600",
    backgroundColor: "#222",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabCountActive: {
    color: "#9b59d0",
    backgroundColor: "#2d1050",
  },

  // List Items
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#161616",
  },
  itemSelected: { backgroundColor: "#140824" },
  itemPressed: { backgroundColor: "#1a1a1a" },
  itemContent: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  itemText: { color: "#ccc", fontSize: 15, flex: 1 },
  itemTextSelected: { color: "#c084fc", fontWeight: "600" },
  itemChapters: { color: "#2e2e2e", fontSize: 12 },
  itemChaptersSelected: { color: "#6a3a9a" },
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function BibleReaderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const initialBook = asString(params.book, "John");
  const initialChapter = parseInt(asString(params.chapter, "1"), 10);
  const highlightVerse = parseInt(asString(params.verse, "0"), 10);

  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [currentChapter, setCurrentChapter] = useState(initialChapter);

  // Reset to params every time this screen gains focus
  // (e.g. coming back from Today → "Read chapter")
  useFocusEffect(
    useCallback(() => {
      const paramBook = asString(params.book);
      const paramChapter = asString(params.chapter);
      // Only reset if params were provided (not empty default navigation)
      if (paramBook) setSelectedBook(paramBook);
      if (paramChapter) setCurrentChapter(parseInt(paramChapter, 10));
    }, [params.book, params.chapter]),
  );
  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [showVersionPicker, setShowVersionPicker] = useState(false);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const versesListRef = useRef<FlatList>(null);

  // Verse tap — journal picker
  const [showJournalPicker, setShowJournalPicker] = useState(false);
  const [journals, setJournals] = useState<Journal[]>([]);

  // Inline create journal from picker
  const [showCreateJournal, setShowCreateJournal] = useState(false);

  // Multi-select mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);

  const currentBookMeta =
    BIBLE_BOOKS.find((b) => b.name === selectedBook) ?? BIBLE_BOOKS[43];

  // Load saved active version on mount — if nothing is downloaded, auto-open picker
  useEffect(() => {
    (async () => {
      const saved = await Storage.getItem(STORAGE_KEY_ACTIVE_VERSION);
      const versionId = saved ?? "EnglishKJBible";
      setActiveVersionId(versionId);

      // If active version isn't downloaded, show picker immediately
      if (!isBibleDownloaded(versionId)) {
        setShowVersionPicker(true);
      }
    })();
  }, []);

  // Only load chapter once activeVersionId is resolved (not null)
  useEffect(() => {
    if (activeVersionId === null) return;
    loadChapter();
  }, [selectedBook, currentChapter, activeVersionId, reloadTrigger]);

  useFocusEffect(
    useCallback(() => {
      loadJournals();
    }, []),
  );

  const loadJournals = async () => {
    const stored = await Storage.getItem(STORAGE_KEYS.journals);
    setJournals(stored ? JSON.parse(stored) : []);
  };

  const saveNewJournalFromPicker = async (data: {
    name: string;
    color: string;
    iconId: string;
  }) => {
    const trimmed = data.name.trim();
    if (!trimmed) return;
    const newJournal = {
      id: Date.now().toString(),
      name: trimmed,
      color: data.color,
      emoji: data.iconId,
      iconId: data.iconId,
      createdAt: new Date().toISOString(),
    };
    const updated = [...journals, newJournal];
    await Storage.setItem(STORAGE_KEYS.journals, JSON.stringify(updated));
    setJournals(updated);
    setShowCreateJournal(false);
    // Re-open journal picker so user can immediately pick the new journal
    setTimeout(() => setShowJournalPicker(true), 350);
  };

  const handleVerseTap = (verse: Verse) => {
    if (selectionMode) {
      const isSelected = selectedVerses.some((v) => v.verse === verse.verse);
      if (isSelected) {
        const next = selectedVerses.filter((v) => v.verse !== verse.verse);
        setSelectedVerses(next);
        if (next.length === 0) setSelectionMode(false);
      } else {
        setSelectedVerses((prev) =>
          [...prev, verse].sort((a, b) => a.verse - b.verse),
        );
      }
    } else {
      setSelectedVerses([verse]);
      setShowJournalPicker(true);
    }
  };

  const handleVerseLongPress = (verse: Verse) => {
    setSelectionMode(true);
    setSelectedVerses([verse]);
  };

  const cancelSelection = () => {
    setSelectionMode(false);
    setSelectedVerses([]);
  };

  const openJournalPickerForSelection = () => {
    if (selectedVerses.length === 0) return;
    setShowJournalPicker(true);
  };

  const goToJournal = (journal: Journal) => {
    if (selectedVerses.length === 0) return;
    setShowJournalPicker(false);
    setSelectionMode(false);

    let verseRef: string;
    let verseText: string;

    if (selectedVerses.length === 1) {
      verseRef = `${selectedBook} ${currentChapter}:${selectedVerses[0].verse}`;
      verseText = selectedVerses[0].text.trim();
    } else {
      const first = selectedVerses[0].verse;
      const last = selectedVerses[selectedVerses.length - 1].verse;
      verseRef = `${selectedBook} ${currentChapter}:${first}-${last}`;
      verseText = selectedVerses
        .map((v) => `[${v.verse}] ${v.text.trim()}`)
        .join("\n");
    }

    router.push(
      `../note-form?journalId=${journal.id}&journalColor=${encodeURIComponent(journal.color)}&initialTitle=${encodeURIComponent(verseRef)}&verseRef=${encodeURIComponent(verseRef)}&verseText=${encodeURIComponent(verseText)}` as any,
    );
    setSelectedVerses([]);
  };

  const loadChapter = async () => {
    if (!activeVersionId) return;
    setLoading(true);
    setChapterData(null);
    setLoadError(null);
    const { data, error } = await fetchChapter(
      selectedBook,
      currentChapter,
      activeVersionId,
    );
    setChapterData(data);
    setLoadError(error ?? null);
    setLoading(false);

    // Scroll to highlighted verse only on the original book+chapter
    if (
      highlightVerse > 0 &&
      data &&
      data.verses.length > 0 &&
      selectedBook === initialBook &&
      currentChapter === initialChapter
    ) {
      const idx = data.verses.findIndex((v) => v.verse === highlightVerse);
      if (idx >= 0) {
        setTimeout(() => {
          versesListRef.current?.scrollToIndex({
            index: idx,
            animated: true,
            viewPosition: 0.25,
          });
        }, 350);
      }
    }
  };

  const goNextChapter = () => {
    if (currentChapter < currentBookMeta.chapters) {
      setCurrentChapter((c) => c + 1);
    }
  };

  const goPrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter((c) => c - 1);
    }
  };

  const handleVersionSelect = async (versionId: string) => {
    setActiveVersionId(versionId);
    setReloadTrigger((n) => n + 1); // force reload even if same version
    await Storage.setItem(STORAGE_KEY_ACTIVE_VERSION, versionId);
    setShowVersionPicker(false);
  };

  const selectBook = (book: string) => {
    setSelectedBook(book);
    setCurrentChapter(1);
    setShowBookPicker(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome6 name="chevron-left" size={18} color="#c084fc" />
        </Pressable>

        <View style={styles.navCenter}>
          <Pressable
            onPress={() => setShowBookPicker(true)}
            style={styles.selectorBtn}
          >
            <Text style={styles.selectorText}>{selectedBook}</Text>
            <FontAwesome6 name="caret-down" size={10} color="#555" />
          </Pressable>

          <Pressable
            onPress={() => setShowChapterPicker(true)}
            style={[styles.selectorBtn, { minWidth: 60 }]}
          >
            <Text style={styles.selectorText}>{currentChapter}</Text>
            <FontAwesome6 name="caret-down" size={10} color="#555" />
          </Pressable>
        </View>

        {/* Version badge button */}
        <Pressable
          onPress={() => setShowVersionPicker(true)}
          style={styles.versionBtn}
        >
          <Text style={styles.versionBtnText}>
            {BIBLE_VERSIONS.find((v) => v.id === activeVersionId)?.shortName ??
              "WEB"}
          </Text>
        </Pressable>
      </View>

      {/* ── Verses ── */}
      {loading || activeVersionId === null ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#c084fc" size="large" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : chapterData ? (
        <FlatList
          ref={versesListRef}
          data={chapterData.verses}
          keyExtractor={(item) => `${item.verse}`}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: insets.bottom + 120,
          }}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={(info) => {
            // Fallback: scroll to end then retry
            versesListRef.current?.scrollToEnd({ animated: false });
            setTimeout(() => {
              versesListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0.25,
              });
            }, 100);
          }}
          ListHeaderComponent={
            <Text style={styles.chapterTitle}>
              {selectedBook} {currentChapter}
            </Text>
          }
          renderItem={({ item }) => {
            const isSelected = selectedVerses.some(
              (v) => v.verse === item.verse,
            );
            const isDailyVerse =
              highlightVerse > 0 &&
              item.verse === highlightVerse &&
              selectedBook === initialBook &&
              currentChapter === initialChapter;
            return (
              <Pressable
                onPress={() => handleVerseTap(item)}
                onLongPress={() => handleVerseLongPress(item)}
                delayLongPress={300}
                style={({ pressed }) => [
                  styles.verseRow,
                  pressed && styles.verseRowPressed,
                  isSelected && styles.verseRowSelected,
                  isDailyVerse && styles.verseRowHighlighted,
                ]}
              >
                {isDailyVerse && !isSelected && (
                  <FontAwesome6
                    name="star"
                    size={10}
                    color="#f5c842"
                    style={{ marginRight: 2, marginTop: 4 }}
                  />
                )}
                {isSelected && (
                  <FontAwesome6
                    name="check"
                    size={12}
                    color="#e040fb"
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text
                  style={[
                    styles.verseNumber,
                    isSelected && { color: "#e040fb" },
                    isDailyVerse &&
                      !isSelected &&
                      styles.verseNumberHighlighted,
                  ]}
                >
                  {item.verse}
                </Text>
                <Text
                  style={[
                    styles.verseText,
                    isSelected && { color: "#fff" },
                    isDailyVerse && !isSelected && styles.verseTextHighlighted,
                  ]}
                >
                  {item.text.trim()}
                </Text>
              </Pressable>
            );
          }}
        />
      ) : loadError?.includes("not downloaded") ? (
        <View style={styles.loadingContainer}>
          <FontAwesome6
            name="book-bible"
            size={40}
            color="#c084fc"
            style={{ marginBottom: 16 }}
          />
          <Text
            style={[
              styles.errorText,
              { color: "#ccc", fontSize: 16, fontWeight: "600" },
            ]}
          >
            Download a Bible version
          </Text>
          <Text style={[styles.errorText, { marginTop: 4 }]}>
            Choose a version to start reading offline.
          </Text>
          <Pressable
            onPress={() => setShowVersionPicker(true)}
            style={[
              styles.retryBtn,
              { backgroundColor: "#1e0a3c", marginTop: 20 },
            ]}
          >
            <FontAwesome6 name="download" size={13} color="#c084fc" />
            <Text style={styles.retryBtnText}>Browse Versions</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <FontAwesome6
            name="circle-exclamation"
            size={32}
            color="#333"
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.errorText}>
            {loadError ?? "Could not load chapter."}
          </Text>
          <Pressable onPress={loadChapter} style={styles.retryBtn}>
            <FontAwesome6 name="rotate-right" size={12} color="#c084fc" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowVersionPicker(true)}
            style={[styles.retryBtn, { marginTop: 8, borderColor: "#2a2a2a" }]}
          >
            <FontAwesome6 name="book-bible" size={12} color="#555" />
            <Text style={[styles.retryBtnText, { color: "#555" }]}>
              Change Version
            </Text>
          </Pressable>
        </View>
      )}

      {/* ── Selection Mode Bar ── */}
      {selectionMode && (
        <View style={[styles.selectionBar, { bottom: insets.bottom + 72 }]}>
          <Pressable onPress={cancelSelection} style={styles.selectionCancel}>
            <Text style={styles.selectionCancelText}>
              <FontAwesome6 name="xmark" size={12} color="#888" /> Cancel
            </Text>
          </Pressable>
          <Text style={styles.selectionCount}>
            {selectedVerses.length} verse
            {selectedVerses.length !== 1 ? "s" : ""} selected
          </Text>
          <Pressable
            onPress={openJournalPickerForSelection}
            style={[
              styles.selectionJournalBtn,
              { opacity: selectedVerses.length > 0 ? 1 : 0.4 },
            ]}
          >
            <Text style={styles.selectionJournalBtnText}>
              <FontAwesome6 name="pen-fancy" size={12} color="#fff" /> Journal
            </Text>
          </Pressable>
        </View>
      )}

      {/* ── Prev / Next ── */}
      <View style={[styles.chapterNav, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={goPrevChapter}
          disabled={currentChapter <= 1}
          style={({ pressed }) => [
            styles.navBtn,
            currentChapter <= 1 && styles.navBtnDisabled,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text
            style={[
              styles.navBtnText,
              currentChapter <= 1 && styles.navBtnTextDisabled,
            ]}
          >
            ‹ Prev
          </Text>
        </Pressable>

        <Text style={styles.navPageText}>
          {currentChapter} / {currentBookMeta.chapters}
        </Text>

        <Pressable
          onPress={goNextChapter}
          disabled={currentChapter >= currentBookMeta.chapters}
          style={({ pressed }) => [
            styles.navBtn,
            currentChapter >= currentBookMeta.chapters && styles.navBtnDisabled,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text
            style={[
              styles.navBtnText,
              currentChapter >= currentBookMeta.chapters &&
                styles.navBtnTextDisabled,
            ]}
          >
            Next ›
          </Text>
        </Pressable>
      </View>

      {/* ── Inline Create Journal (from picker) ── */}
      <CreateJournalModal
        visible={showCreateJournal}
        onClose={() => setShowCreateJournal(false)}
        onSave={saveNewJournalFromPicker}
      />

      {/* ── Version Picker Modal ── */}
      <VersionPickerModal
        visible={showVersionPicker}
        activeVersionId={activeVersionId ?? "EnglishKJBible"}
        onSelect={handleVersionSelect}
        onClose={() => setShowVersionPicker(false)}
      />

      {/* ── Book Picker Modal (new) ── */}
      <BookPickerModal
        visible={showBookPicker}
        selectedBook={selectedBook}
        onSelect={selectBook}
        onClose={() => setShowBookPicker(false)}
      />

      {/* ── Chapter Picker Modal ── */}
      {showChapterPicker && (
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerBox, { maxHeight: 400 }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Chapter</Text>
              <Pressable onPress={() => setShowChapterPicker(false)}>
                <FontAwesome6 name="xmark" size={14} color="#555" />
              </Pressable>
            </View>
            <FlatList
              data={Array.from(
                { length: currentBookMeta.chapters },
                (_, i) => i + 1,
              )}
              keyExtractor={(c) => `${c}`}
              numColumns={5}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 12, gap: 8 }}
              columnWrapperStyle={{ gap: 8 }}
              renderItem={({ item: ch }) => (
                <Pressable
                  onPress={() => {
                    setCurrentChapter(ch);
                    setShowChapterPicker(false);
                  }}
                  style={({ pressed }) => [
                    styles.chapterCell,
                    ch === currentChapter && styles.chapterCellSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.chapterCellText,
                      ch === currentChapter && styles.chapterCellTextSelected,
                    ]}
                  >
                    {ch}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      )}

      {/* ── Journal Picker Modal ── */}
      <Modal
        transparent
        visible={showJournalPicker}
        animationType="slide"
        onRequestClose={() => setShowJournalPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowJournalPicker(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.journalPickerBox}>
              {selectedVerses.length > 0 && (
                <View style={styles.versePreview}>
                  <Text style={styles.versePreviewRef}>
                    {selectedVerses.length === 1
                      ? `${selectedBook} ${currentChapter}:${selectedVerses[0].verse}`
                      : `${selectedBook} ${currentChapter}:${selectedVerses[0].verse}-${selectedVerses[selectedVerses.length - 1].verse}`}
                  </Text>
                  <Text style={styles.versePreviewText} numberOfLines={4}>
                    {selectedVerses.length === 1
                      ? `"${selectedVerses[0].text.trim()}"`
                      : selectedVerses
                          .map((v) => `[${v.verse}] ${v.text.trim()}`)
                          .join("\n")}
                  </Text>
                </View>
              )}

              <View style={styles.journalPickerHeader}>
                <Text style={styles.journalPickerTitle}>
                  <FontAwesome6 name="pen-fancy" size={13} color="#fff" />
                  {"  "}
                  Write about this verse
                </Text>
                <Pressable onPress={() => setShowJournalPicker(false)}>
                  <FontAwesome6 name="xmark" size={14} color="#555" />
                </Pressable>
              </View>

              <Text style={styles.journalPickerSub}>
                Choose a journal for this reflection
              </Text>

              {journals.length === 0 ? (
                <View style={styles.noJournals}>
                  <FontAwesome6
                    name="book-open"
                    size={28}
                    color="#333"
                    style={{ marginBottom: 10 }}
                  />
                  <Text style={styles.noJournalsText}>No journals yet</Text>
                  <Text style={styles.noJournalsSubText}>
                    Create one to start reflecting on this verse
                  </Text>
                  <Pressable
                    onPress={() => {
                      setShowJournalPicker(false);
                      // Small delay so picker dismisses cleanly before create modal opens
                      setTimeout(() => setShowCreateJournal(true), 300);
                    }}
                    style={({ pressed }) => [
                      styles.createJournalBtn,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <FontAwesome6 name="plus" size={13} color="#fff" />
                    <Text style={styles.createJournalBtnText}>
                      Create a Journal
                    </Text>
                  </Pressable>
                </View>
              ) : (
                journals.map((j) => (
                  <Pressable
                    key={j.id}
                    onPress={() => goToJournal(j)}
                    style={({ pressed }) => [
                      styles.journalPickerRow,
                      pressed && { backgroundColor: "#1a1a1a" },
                    ]}
                  >
                    <View
                      style={[
                        styles.journalPickerIcon,
                        { backgroundColor: j.color + "22" },
                      ]}
                    >
                      <JournalIcon
                        iconId={j.iconId ?? "journals"}
                        color={j.color}
                        size={18}
                      />
                    </View>
                    <Text style={styles.journalPickerName}>{j.name}</Text>
                    <FontAwesome6
                      name="chevron-right"
                      size={14}
                      color={j.color}
                    />
                  </Pressable>
                ))
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  backBtn: { width: 36, padding: 4 },
  navCenter: { flexDirection: "row", gap: 8, alignItems: "center" },
  versionBtn: {
    backgroundColor: "#1e0a3c",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#3d1f6e",
    minWidth: 46,
    alignItems: "center",
  },
  versionBtnText: {
    color: "#c084fc",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  selectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161616",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  selectorText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  chapterTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  verseRow: {
    flexDirection: "row",
    marginBottom: 14,
    gap: 10,
    alignItems: "flex-start",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  verseRowPressed: { backgroundColor: "#1a1a2e" },
  verseRowSelected: { backgroundColor: "#1a0a2e", borderRadius: 8 },
  verseRowHighlighted: {
    backgroundColor: "#1f1800",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f5c84230",
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 16,
  },
  verseNumberHighlighted: { color: "#f5c842" },
  verseTextHighlighted: { color: "#fff8dc", fontWeight: "500" },
  verseNumber: {
    color: "#c084fc",
    fontSize: 11,
    fontWeight: "700",
    minWidth: 22,
    marginTop: 3,
  },
  verseText: { color: "#d0d0d0", fontSize: 16, lineHeight: 26, flex: 1 },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { color: "#555", fontSize: 14 },
  errorText: {
    color: "#555",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 32,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3d1f6e",
  },
  retryBtnText: { color: "#c084fc", fontSize: 14, fontWeight: "600" },

  chapterNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#111",
  },
  navBtn: {
    backgroundColor: "#161616",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: "#c084fc", fontSize: 14, fontWeight: "600" },
  navBtnTextDisabled: { color: "#555" },
  navPageText: { color: "#444", fontSize: 13 },

  // Legacy overlay picker (still used for chapter picker)
  pickerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerBox: {
    backgroundColor: "#161616",
    borderRadius: 16,
    width: 300,
    maxHeight: 500,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#242424",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  pickerTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 13 },
  pickerItemSelected: { backgroundColor: "#1a1a2e" },
  pickerItemText: { color: "#ccc", fontSize: 15 },
  pickerItemTextSelected: { color: "#c084fc", fontWeight: "600" },

  chapterCell: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chapterCellSelected: { backgroundColor: "#2a1a40" },
  chapterCellText: { color: "#aaa", fontSize: 14, fontWeight: "500" },
  chapterCellTextSelected: { color: "#c084fc", fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  journalPickerBox: {
    backgroundColor: "#161616",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: "#242424",
    overflow: "hidden",
  },
  versePreview: {
    backgroundColor: "#0e0e1a",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e2e",
  },
  versePreviewRef: {
    color: "#c084fc",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  versePreviewText: {
    color: "#9988cc",
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 20,
  },
  journalPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  journalPickerTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  journalPickerSub: {
    color: "#444",
    fontSize: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  journalPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  journalPickerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  journalPickerName: {
    color: "#e0e0e0",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  noJournals: {
    padding: 28,
    alignItems: "center",
    gap: 6,
  },
  noJournalsText: { color: "#ccc", fontSize: 15, fontWeight: "600" },
  noJournalsSubText: {
    color: "#444",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  createJournalBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#c084fc",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
    marginTop: 4,
  },
  createJournalBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  selectionBar: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "#1a0a2e",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#3d1f6e",
    zIndex: 50,
  },
  selectionCancel: { paddingVertical: 4, paddingRight: 8 },
  selectionCancelText: { color: "#888", fontSize: 13 },
  selectionCount: {
    color: "#c084fc",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  selectionJournalBtn: {
    backgroundColor: "#c084fc",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  selectionJournalBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
