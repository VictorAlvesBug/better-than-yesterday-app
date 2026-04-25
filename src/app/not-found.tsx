import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/auth";
import useNavigation from "../hooks/useNavigation";

export default function NotFoundScreen() {
    const { signOut } = useAuth();
    const navigation = useNavigation();

    const goHome = () => {
        signOut();
    };

    return (
        <View style={styles.content}>
            <Text style={styles.code}>404</Text>
            <Text style={styles.title}>Page not found</Text>
            <Text style={styles.description}>
                The screen you’re trying to open does not exist.
            </Text>

            <TouchableOpacity
                style={styles.primaryButton}
                onPress={goHome}
            >
                <Text style={styles.primaryButtonText}>Go to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.back()}>
                <Text style={styles.backText}>Go back</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    code: {
        fontSize: 72,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 24,
    },
    primaryButton: {
        backgroundColor: "#111827",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 12,
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    backText: {
        fontSize: 15,
        color: "#2563eb",
    },
});