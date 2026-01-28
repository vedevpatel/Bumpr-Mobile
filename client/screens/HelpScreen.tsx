import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What is Bumpr?",
    answer: "Bumpr is a real-time, AI-powered information layer for the physical world that helps you connect with people nearby. It replaces traditional social media feeds with spatial, location-anchored social infrastructure.",
  },
  {
    question: "How does the handshake system work?",
    answer: "When you want to connect with someone nearby, you send a handshake request. If they accept, you both unlock each other's full profiles. This ensures mutual consent before any personal information is shared.",
  },
  {
    question: "Is my exact location shared?",
    answer: "No. Bumpr never shares your exact location. Only distance bands (close, nearby, in the area) are shown to other users. Your privacy is our priority.",
  },
  {
    question: "What are AR Moments?",
    answer: "AR Moments are short-form videos (5-15 seconds) tied to specific locations. They're only visible to people nearby and expire after a set time, keeping content relevant and local.",
  },
  {
    question: "How is my reputation calculated?",
    answer: "Your Clique Reputation is based on verified proximity interactions, consistent positive feedback from connections, diversity of contexts, and behavioral stability. It reflects real-world trust, not follower counts.",
  },
];

export default function HelpScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const handleToggle = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL("mailto:support@bumpr.app");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>
          Help & Support
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.xl }}>
          Find answers to common questions or reach out to our team.
        </ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={[styles.section, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
      >
        <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
          Frequently Asked Questions
        </ThemedText>

        {FAQ_ITEMS.map((item, index) => (
          <View key={index}>
            {index > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
            <Pressable
              style={({ pressed }) => [styles.faqItem, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => handleToggle(index)}
            >
              <View style={styles.faqHeader}>
                <ThemedText type="body" style={{ flex: 1, fontWeight: "500" }}>
                  {item.question}
                </ThemedText>
                <Feather
                  name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.textSecondary}
                />
              </View>
              {expandedIndex === index && (
                <ThemedText
                  type="body"
                  style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
                >
                  {item.answer}
                </ThemedText>
              )}
            </Pressable>
          </View>
        ))}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={[styles.section, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
      >
        <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
          Contact Us
        </ThemedText>

        <Pressable
          style={({ pressed }) => [styles.contactRow, { opacity: pressed ? 0.7 : 1 }]}
          onPress={handleContact}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}15` }]}>
            <Feather name="mail" size={20} color={theme.primary} />
          </View>
          <View style={styles.contactInfo}>
            <ThemedText type="body" style={{ fontWeight: "500" }}>
              Email Support
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              support@bumpr.app
            </ThemedText>
          </View>
          <Feather name="external-link" size={18} color={theme.textSecondary} />
        </Pressable>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        style={styles.versionContainer}
      >
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          Bumpr v1.0.0
        </ThemedText>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  faqItem: {
    paddingVertical: Spacing.sm,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  divider: {
    height: 1,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  versionContainer: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
});
