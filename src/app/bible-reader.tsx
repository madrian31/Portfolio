import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
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

// ─── Fetch chapter from Bible API ─────────────────────────────────────────────

async function fetchChapter(
  book: string,
  chapter: number,
): Promise<BibleChapter | null> {
  try {
    const url = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?verse_numbers=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    return {
      reference: data.reference,
      verses: data.verses ?? [],
    };
  } catch {
    return null;
  }
}

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
  // Optional: highlight + scroll to a specific verse (e.g. from daily verse)
  const highlightVerse = parseInt(asString(params.verse, "0"), 10);

  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);

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

  useEffect(() => {
    loadChapter();
  }, [selectedBook, currentChapter]);

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
    setLoading(true);
    setChapterData(null);
    const data = await fetchChapter(selectedBook, currentChapter);
    setChapterData(data);
    setLoading(false);

    // Scroll to highlighted verse once list renders
    if (highlightVerse > 0 && data && data.verses.length > 0) {
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

        <View style={{ width: 36 }} />
      </View>

      {/* ── Verses ── */}
      {loading ? (
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
              highlightVerse > 0 && item.verse === highlightVerse;
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
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            Could not load chapter.{"\n"}Check your internet connection.
          </Text>
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
  errorText: { color: "#555", fontSize: 14, textAlign: "center" },

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
