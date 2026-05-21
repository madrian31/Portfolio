// ─── Shared Prayer Components ─────────────────────────────────────────────────
// Used by both today.tsx and prayer-list.tsx

import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, Text, View } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PrayerStatus = "pending" | "answered" | "archived";

export type PrayerUpdate = {
  id: string;
  text: string;
  date: string;
};

export type Prayer = {
  id: string;
  title: string;
  description: string;
  status: PrayerStatus;
  tags: string[];
  emoji: string;
  isPrivate: boolean;
  createdAt: string;
  answeredAt?: string;
  updates: PrayerUpdate[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const PRAYER_STORAGE_KEY = "prayer_list";

export const STATUS_CONFIG: Record<
  PrayerStatus,
  { label: string; color: string; faIcon: string; bg: string }
> = {
  pending: {
    label: "Praying",
    color: "#c084fc",
    faIcon: "hands-praying",
    bg: "#c084fc12",
  },
  answered: {
    label: "Answered",
    color: "#4ade80",
    faIcon: "circle-check",
    bg: "#4ade8012",
  },
  archived: {
    label: "Archived",
    color: "#555555",
    faIcon: "box-archive",
    bg: "#55555512",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// ─── PrayerCard ───────────────────────────────────────────────────────────────

import { Pressable } from "react-native";

export function PrayerCard({
  item,
  onPress,
  onLongPress,
  compact = false,
}: {
  item: Prayer;
  onPress: () => void;
  onLongPress?: () => void;
  compact?: boolean;
}) {
  const cfg = STATUS_CONFIG[item.status];
  const isAnswered = item.status === "answered";
  const isArchived = item.status === "archived";

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={({ pressed }) => [
        cardStyles.card,
        isAnswered && cardStyles.cardAnswered,
        isArchived && cardStyles.cardArchived,
        compact && cardStyles.cardCompact,
        pressed && { opacity: 0.75 },
      ]}
    >
      {/* Top row */}
      <View style={cardStyles.topRow}>
        <View style={[cardStyles.iconWrap, { backgroundColor: cfg.bg }]}>
          <FontAwesome6
            name={item.emoji || "hands-praying"}
            size={compact ? 15 : 18}
            color={cfg.color}
          />
        </View>

        <View style={cardStyles.titleBlock}>
          <Text
            style={[
              cardStyles.title,
              isArchived && cardStyles.titleArchived,
              compact && cardStyles.titleCompact,
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!compact && item.description ? (
            <Text style={cardStyles.desc} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
        </View>

        <View style={cardStyles.rightBlock}>
          {isAnswered ? (
            <View style={cardStyles.answeredBadge}>
              <FontAwesome6 name="circle-check" size={10} color="#4ade80" />
              {!compact && (
                <Text style={cardStyles.answeredBadgeText}>Answered</Text>
              )}
            </View>
          ) : (
            <FontAwesome6
              name={cfg.faIcon}
              size={13}
              color={cfg.color}
              style={{ opacity: 0.7 }}
            />
          )}
        </View>
      </View>

      {/* Tags row — always rendered in non-compact to keep consistent height */}
      {!compact && (
        <View style={cardStyles.tagsRow}>
          {item.tags.slice(0, 3).map((t) => (
            <View key={t} style={cardStyles.tag}>
              <Text style={cardStyles.tagText}>{t}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <View style={cardStyles.tag}>
              <Text style={cardStyles.tagText}>+{item.tags.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={cardStyles.footer}>
        <Text style={cardStyles.footerDate}>{timeAgo(item.createdAt)}</Text>
        <View style={cardStyles.footerRight}>
          {item.updates.length > 0 && (
            <View style={cardStyles.updatePill}>
              <FontAwesome6 name="clock-rotate-left" size={9} color="#c084fc" />
              {!compact && (
                <Text style={cardStyles.updatePillText}>
                  {item.updates.length} update
                  {item.updates.length !== 1 ? "s" : ""}
                </Text>
              )}
              {compact && (
                <Text style={cardStyles.updatePillText}>
                  {item.updates.length}
                </Text>
              )}
            </View>
          )}
          {item.isPrivate && (
            <FontAwesome6 name="lock" size={10} color="#333" />
          )}
        </View>
      </View>

      {/* Answered bottom glow */}
      {isAnswered && <View style={cardStyles.answeredLine} />}
    </Pressable>
  );
}

// ─── StatsBar ─────────────────────────────────────────────────────────────────

export function StatsBar({ prayers }: { prayers: Prayer[] }) {
  const pending = prayers.filter((p) => p.status === "pending").length;
  const answered = prayers.filter((p) => p.status === "answered").length;
  const total = prayers.length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <View style={statsStyles.wrap}>
      <View style={statsStyles.stat}>
        <Text style={statsStyles.statNum}>{pending}</Text>
        <Text style={statsStyles.statLabel}>Praying</Text>
      </View>
      <View style={statsStyles.divider} />
      <View style={statsStyles.stat}>
        <Text style={[statsStyles.statNum, { color: "#4ade80" }]}>
          {answered}
        </Text>
        <Text style={statsStyles.statLabel}>Answered</Text>
      </View>
      <View style={statsStyles.divider} />
      <View
        style={[
          statsStyles.stat,
          { flex: 2, alignItems: "flex-start", paddingLeft: 16 },
        ]}
      >
        <View style={statsStyles.progressTrack}>
          <View
            style={[statsStyles.progressFill, { width: `${pct}%` as any }]}
          />
        </View>
        <Text style={statsStyles.statLabel}>{pct}% answered</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#0f0f0f",
    borderRadius: 16,
    marginBottom: 10,
    padding: 14,
    minHeight: 96,
    borderWidth: 1,
    borderColor: "#1c1c1c",
    overflow: "hidden",
  },
  cardCompact: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    minHeight: 80,
  },
  cardAnswered: { borderColor: "#4ade8025", backgroundColor: "#0a110a" },
  cardArchived: { opacity: 0.5 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: { flex: 1 },
  title: { color: "#f0f0f0", fontSize: 15, fontWeight: "600", lineHeight: 20 },
  titleCompact: { fontSize: 14 },
  titleArchived: { color: "#555" },
  desc: { color: "#555", fontSize: 12, marginTop: 2, lineHeight: 16 },
  rightBlock: { alignItems: "flex-end" },
  answeredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#4ade8015",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#4ade8030",
  },
  answeredBadgeText: { color: "#4ade80", fontSize: 10, fontWeight: "700" },
  tagsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
    flexWrap: "wrap",
    minHeight: 22,
  },
  tag: {
    backgroundColor: "#1a1a1a",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { color: "#555", fontSize: 11 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerDate: { color: "#333", fontSize: 11 },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  updatePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#c084fc12",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  updatePillText: { color: "#c084fc", fontSize: 10, fontWeight: "600" },
  answeredLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#4ade8030",
  },
});

const statsStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1c1c1c",
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  stat: { flex: 1, alignItems: "center" },
  statNum: { color: "#c084fc", fontSize: 22, fontWeight: "700" },
  statLabel: { color: "#444", fontSize: 11, marginTop: 2 },
  divider: { width: 1, height: 32, backgroundColor: "#1c1c1c" },
  progressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "#1c1c1c",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4ade80",
    borderRadius: 2,
  },
});
