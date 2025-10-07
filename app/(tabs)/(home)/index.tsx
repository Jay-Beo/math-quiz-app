import React from "react";
import { Stack, Link } from "expo-router";
import { FlatList, Pressable, StyleSheet, View, Text, Alert, Platform } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";

const ICON_COLOR = "#007AFF";

export default function HomeScreen() {
  const theme = useTheme();
  const modalDemos = [
    {
      title: "Math Quiz Game",
      description: "Quick calculation quiz with timer",
      route: "/quiz",
      color: "#007BFF",
    }
  ];

  const renderModalDemo = ({ item }: { item: (typeof modalDemos)[0] }) => (
    <GlassView style={[
      styles.demoCard,
      Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
    ]} glassEffectStyle="regular">
      <View style={[styles.demoIcon, { backgroundColor: item.color }]}>
        <IconSymbol name="square.grid.3x3" color="white" size={24} />
      </View>
      <View style={styles.demoContent}>
        <Text style={[styles.demoTitle, { color: theme.colors.text }]}>{item.title}</Text>
        <Text style={[styles.demoDescription, { color: theme.dark ? '#98989D' : '#666' }]}>{item.description}</Text>
      </View>
      <Link href={item.route as any} asChild>
        <Pressable>
          <GlassView style={[
            styles.tryButton,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }
          ]} glassEffectStyle="clear">
            <Text style={[styles.tryButtonText, { color: theme.colors.primary }]}>Try It</Text>
          </GlassView>
        </Pressable>
      </Link>
    </GlassView>
  );

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => Alert.alert("Not Implemented", "This feature is not implemented yet")}
      style={styles.headerButtonContainer}
    >
      <IconSymbol name="plus" color={theme.colors.primary} />
    </Pressable>
  );

  const renderHeaderLeft = () => (
    <Pressable
      onPress={() => Alert.alert("Not Implemented", "This feature is not implemented yet")}
      style={styles.headerButtonContainer}
    >
      <IconSymbol
        name="gear"
        color={theme.colors.primary}
      />
    </Pressable>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Building the app...",
            headerRight: renderHeaderRight,
            headerLeft: renderHeaderLeft,
          }}
        />
      )}
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <FlatList
          data={modalDemos}
          renderItem={renderModalDemo}
          keyExtractor={(item) => item.route}
          contentContainerStyle={[
            styles.listContainer,
            Platform.OS !== 'ios' && styles.listContainerWithTabBar
          ]}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor handled dynamically
  },
  listContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  listContainerWithTabBar: {
    paddingBottom: 100, // Extra padding for floating tab bar
  },
  demoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  demoContent: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    // color handled dynamically
  },
  demoDescription: {
    fontSize: 14,
    lineHeight: 18,
    // color handled dynamically
  },
  headerButtonContainer: {
    padding: 6,
  },
  tryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    // color handled dynamically
  },
});
